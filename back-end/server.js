const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const OpenAI = require('openai');

dotenv.config();

const { pool, initializeDatabase, testConnection } = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
const BCRYPT_ROUNDS = 10;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const openaiClient = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const ALLOWED_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, Postman)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

app.post('/api/auth/token', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    // Query the users table for this email/username
    const [rows] = await pool.execute(
      'SELECT id, email, password FROM users WHERE email = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // Compare provided password with stored hash
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.email, userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, token_type: 'Bearer', expires_in: JWT_EXPIRES_IN });
  } catch (error) {
    console.error('POST /api/auth/token error:', error);
    return res.status(500).json({ error: 'Failed to create token' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, confirmPassword, org_name, org_type } = req.body;
    const normalizedOrgName = String(org_name || '').trim();
    const normalizedOrgType = String(org_type || '').trim();

    if (!username || !password || !confirmPassword || !normalizedOrgName || !normalizedOrgType) {
      return res.status(400).json({ error: 'email, password, organization name, and organization type are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Do not allow someone else to register an organization already claimed by another login user.
    const [existingOrgUsers] = await pool.execute(
      'SELECT id FROM users WHERE org_name = ? AND org_type = ? LIMIT 1',
      [normalizedOrgName, normalizedOrgType]
    );

    if (existingOrgUsers.length > 0) {
      return res.status(409).json({
        error: 'This organization is already linked to an existing account. Please sign in instead.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, org_name, org_type) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, normalizedOrgName, normalizedOrgType]
    );

    const token = jwt.sign({ username, userId: result.insertId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(201).json({ 
      token, 
      token_type: 'Bearer', 
      expires_in: JWT_EXPIRES_IN,
      user: { username, org_name: normalizedOrgName, org_type: normalizedOrgType },
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('POST /api/auth/register error:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({ error: 'Google login is not configured on the server' });
    }

    const { id_token } = req.body;
    if (!id_token) {
      return res.status(400).json({ error: 'id_token is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'Invalid Google token payload' });
    }

    const username = payload.email;
    const name = payload.name || payload.email;
    const token = jwt.sign(
      { username, name, authProvider: 'google' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      token_type: 'Bearer',
      expires_in: JWT_EXPIRES_IN,
      user: { username, name, provider: 'google' }
    });
  } catch (error) {
    console.error('POST /api/auth/google error:', error);
    return res.status(401).json({ error: 'Google login failed' });
  }
});

function requireJwt(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.post('/api/org/availability', async (req, res) => {
  try {
    const { org_name, org_type } = req.body;
    const normalizedOrgName = String(org_name || '').trim();
    const normalizedOrgType = String(org_type || '').trim();

    if (!normalizedOrgName || !normalizedOrgType) {
      return res.status(400).json({ error: 'org_name and org_type are required' });
    }

    let currentUserId = null;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        currentUserId = payload?.userId || null;
      } catch {
        currentUserId = null;
      }
    }

    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE org_name = ? AND org_type = ? LIMIT 1',
      [normalizedOrgName, normalizedOrgType]
    );

    if (!rows.length) {
      return res.json({ claimed: false, ownedByCurrentUser: false });
    }

    const ownerUserId = Number(rows[0].id);
    const ownedByCurrentUser = Number(currentUserId) === ownerUserId;
    return res.json({ claimed: true, ownedByCurrentUser });
  } catch (error) {
    console.error('POST /api/org/availability error:', error);
    return res.status(500).json({ error: 'Failed to check organization availability' });
  }
});

app.post('/api/assessment/guest', async (req, res) => {
  try {
    const { org_name, org_type, answers, score, risk_level } = req.body;
    const normalizedOrgName = String(org_name || '').trim();
    const normalizedOrgType = String(org_type || '').trim();

    if (!normalizedOrgName || !normalizedOrgType || !answers || score === undefined || !risk_level) {
      return res.status(400).json({
        error: 'Missing required fields: org_name, org_type, answers, score, risk_level'
      });
    }

    // Do not allow one-time/guest submissions for organizations owned by registered users.
    const [claimedOrgRows] = await pool.execute(
      'SELECT id FROM users WHERE org_name = ? AND org_type = ? LIMIT 1',
      [normalizedOrgName, normalizedOrgType]
    );

    if (claimedOrgRows.length > 0) {
      return res.status(403).json({
        error: 'This organization is linked to an account. Please sign in to continue.'
      });
    }

    const insertSql = `
      INSERT INTO assessments (user_id, org_name, org_type, answers, score, risk_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(insertSql, [
      null,
      normalizedOrgName,
      normalizedOrgType,
      JSON.stringify(answers),
      Number(score),
      risk_level
    ]);

    return res.status(201).json({
      id: result.insertId,
      mode: 'one-time',
      message: 'One-time assessment saved successfully'
    });
  } catch (error) {
    console.error('POST /api/assessment/guest error:', error);
    return res.status(500).json({ error: 'Failed to save one-time assessment' });
  }
});

app.post('/api/assessment', requireJwt, async (req, res) => {
  try {
    const { org_name, org_type, answers, score, risk_level } = req.body;
    const normalizedOrgName = String(org_name || '').trim();
    const normalizedOrgType = String(org_type || '').trim();

    if (!normalizedOrgName || !normalizedOrgType || !answers || score === undefined || !risk_level) {
      return res.status(400).json({
        error: 'Missing required fields: org_name, org_type, answers, score, risk_level'
      });
    }

    const [userRows] = await pool.execute(
      'SELECT org_name, org_type FROM users WHERE id = ? LIMIT 1',
      [req.user.userId]
    );

    if (!userRows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userOrgName = String(userRows[0].org_name || '').trim();
    const userOrgType = String(userRows[0].org_type || '').trim();

    // Enforce that logged-in users can only save assessments for their own registered organization.
    if (userOrgName && userOrgType) {
      const sameOrg = userOrgName === normalizedOrgName && userOrgType === normalizedOrgType;
      if (!sameOrg) {
        return res.status(403).json({
          error: 'You can only save assessments for your registered organization.'
        });
      }
    }

    const insertSql = `
      INSERT INTO assessments (user_id, org_name, org_type, answers, score, risk_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(insertSql, [
      req.user.userId,
      normalizedOrgName,
      normalizedOrgType,
      JSON.stringify(answers),
      Number(score),
      risk_level
    ]);

    return res.status(201).json({
      id: result.insertId,
      message: 'Assessment saved successfully'
    });
  } catch (error) {
    console.error('POST /api/assessment error:', error);
    return res.status(500).json({ error: 'Failed to save assessment' });
  }
});

app.post('/api/assessment/:id/pdf', requireJwt, async (req, res) => {
  try {
    const assessmentId = Number(req.params.id);
    const { file_name, pdf_base64 } = req.body;

    if (!Number.isInteger(assessmentId) || assessmentId <= 0) {
      return res.status(400).json({ error: 'Invalid assessment id' });
    }

    if (!file_name || !pdf_base64) {
      return res.status(400).json({ error: 'file_name and pdf_base64 are required' });
    }

    const [userRows] = await pool.execute(
      'SELECT org_name, org_type FROM users WHERE id = ? LIMIT 1',
      [req.user.userId]
    );

    const userOrgName = userRows[0]?.org_name || null;
    const userOrgType = userRows[0]?.org_type || null;

    const [assessmentRows] = await pool.execute(
      `SELECT id
       FROM assessments
       WHERE id = ?
         AND (
           user_id = ?
           OR (user_id IS NULL AND org_name = ? AND org_type = ?)
         )
       LIMIT 1`,
      [assessmentId, req.user.userId, userOrgName, userOrgType]
    );

    if (!assessmentRows.length) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const normalizedBase64 = String(pdf_base64).replace(/^data:application\/pdf;base64,/, '').trim();
    const pdfBuffer = Buffer.from(normalizedBase64, 'base64');

    if (!pdfBuffer.length) {
      return res.status(400).json({ error: 'Invalid PDF payload' });
    }

    await pool.execute(
      `INSERT INTO assessment_reports (assessment_id, user_id, file_name, mime_type, pdf_data)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         file_name = VALUES(file_name),
         mime_type = VALUES(mime_type),
         pdf_data = VALUES(pdf_data),
         updated_at = CURRENT_TIMESTAMP`,
      [assessmentId, req.user.userId, String(file_name).slice(0, 255), 'application/pdf', pdfBuffer]
    );

    return res.status(201).json({ message: 'PDF saved successfully', assessment_id: assessmentId });
  } catch (error) {
    console.error('POST /api/assessment/:id/pdf error:', error);
    return res.status(500).json({ error: 'Failed to save PDF report' });
  }
});

app.get('/api/assessment/:id/pdf', requireJwt, async (req, res) => {
  try {
    const assessmentId = Number(req.params.id);

    if (!Number.isInteger(assessmentId) || assessmentId <= 0) {
      return res.status(400).json({ error: 'Invalid assessment id' });
    }

    const [rows] = await pool.execute(
      `SELECT id, assessment_id, file_name, mime_type, pdf_data, created_at, updated_at
       FROM assessment_reports
       WHERE assessment_id = ? AND user_id = ?
       LIMIT 1`,
      [assessmentId, req.user.userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'PDF report not found' });
    }

    const row = rows[0];
    return res.json({
      id: row.id,
      assessment_id: row.assessment_id,
      file_name: row.file_name,
      mime_type: row.mime_type,
      pdf_base64: row.pdf_data ? row.pdf_data.toString('base64') : '',
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  } catch (error) {
    console.error('GET /api/assessment/:id/pdf error:', error);
    return res.status(500).json({ error: 'Failed to retrieve PDF report' });
  }
});

app.get('/api/assessment-pdfs', requireJwt, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, assessment_id, file_name, created_at, updated_at
       FROM assessment_reports
       WHERE user_id = ?
       ORDER BY updated_at DESC, id DESC`,
      [req.user.userId]
    );

    return res.json(rows);
  } catch (error) {
    console.error('GET /api/assessment-pdfs error:', error);
    return res.status(500).json({ error: 'Failed to retrieve PDF report list' });
  }
});


app.get('/api/assessment/:id', requireJwt, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid assessment id' });
    }

    const [userRows] = await pool.execute(
      'SELECT org_name, org_type FROM users WHERE id = ? LIMIT 1',
      [req.user.userId]
    );

    const userOrgName = userRows[0]?.org_name || null;
    const userOrgType = userRows[0]?.org_type || null;

    const [rows] = await pool.execute(
      `SELECT id, user_id, org_name, org_type, answers, score, risk_level, created_at
       FROM assessments
       WHERE id = ?
         AND (
           user_id = ?
           OR (user_id IS NULL AND org_name = ? AND org_type = ?)
         )
       LIMIT 1`,
      [id, req.user.userId, userOrgName, userOrgType]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const assessment = rows[0];
    try {
      assessment.answers = JSON.parse(assessment.answers);
    } catch {
      // Keep raw value if JSON parsing fails.
    }

    return res.json(assessment);
  } catch (error) {
    console.error('GET /api/assessment/:id error:', error);
    return res.status(500).json({ error: 'Failed to retrieve assessment' });
  }
});

app.get('/api/assessments', requireJwt, async (req, res) => {
  try {
    // Return only this user's assessments; include legacy org-scoped rows for backward compatibility.
    const [userRows] = await pool.execute(
      'SELECT org_name, org_type FROM users WHERE id = ? LIMIT 1',
      [req.user.userId]
    );

    const userOrgName = userRows[0]?.org_name || null;
    const userOrgType = userRows[0]?.org_type || null;

    const [rows] = await pool.execute(
      `SELECT id, user_id, org_name, org_type, answers, score, risk_level, created_at
       FROM assessments
       WHERE user_id = ?
          OR (user_id IS NULL AND org_name = ? AND org_type = ?)
       ORDER BY created_at DESC, id DESC`,
      [req.user.userId, userOrgName, userOrgType]
    );

    const normalized = rows.map((row) => {
      let parsedAnswers = row.answers;
      try {
        parsedAnswers = JSON.parse(row.answers);
      } catch {
        // Keep raw answers when parsing fails.
      }

      return {
        ...row,
        answers: parsedAnswers,
        score: Number(row.score)
      };
    });

    return res.json(normalized);
  } catch (error) {
    console.error('GET /api/assessments error:', error);
    return res.status(500).json({ error: 'Failed to retrieve assessments' });
  }
});

app.get('/api/users/me', requireJwt, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, org_name, org_type, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('GET /api/users/me error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});


// ─── AI REPORT ───────────────────────────────────────────────────
const REPORT_HEADINGS = [
  '## What this score means',
  '## Your biggest risks right now',
  '## Top 3 things to fix first',
  "## What you're doing well"
];

function normalizeWhitespace(text) {
  return String(text || '').replace(/\r/g, '').trim();
}

function buildReportContext({ scores }) {
  const CAT_NAMES = ['Access Control', 'Data Protection', 'Device & Network', 'Incident Response', 'Security Awareness'];
  const CAT_MAX = [18, 17, 15, 16, 14];

  const catData = CAT_NAMES.map((name, i) => ({
    name,
    score: scores.cats[i],
    max: CAT_MAX[i],
    pct: Math.round((scores.cats[i] / CAT_MAX[i]) * 100)
  }));

  const weakest = [...catData]
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  const strongest = [...catData]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 2);

  return { catData, weakest, strongest };
}

function buildAiPrompt({ scores, tier, orgName, orgType }) {
  const { catData, weakest } = buildReportContext({ scores });

  return `You are a friendly cybersecurity advisor explaining security results to a small business owner (${orgName}, a ${orgType}) with no IT background.
Write as if you are talking to a smart friend who has never worked in tech.
Never assume they know what any security term means.
If you must use a technical term, explain it immediately in plain English in parentheses — for example: "malware (harmful software that can steal or destroy your files)".
Your goal is to help them understand what is wrong, why it matters to their business, and exactly what to do about it — in language their grandmother could follow.

Assessment Results for ${orgName} (${orgType}):
- Overall Cyber Risk Score: ${scores.pct}/100 — ${tier.label} Risk
${catData.map((c) => `- ${c.name}: ${c.score}/${c.max} pts (${c.pct}%)`).join('\n')}

Weakest areas: ${weakest.map((w) => `${w.name} (${w.pct}%)`).join(', ')}

Plain English Rules — follow these strictly throughout the entire report:
- Never describe a risk without immediately explaining what it means in real life — in dollars lost, data stolen, or reputation damaged.
- Every risk must be followed by a one-sentence real-world example written as if it happened to a similar business. For example: "A small accounting firm had all their client tax records stolen because one employee reused a password from a shopping website."
- Every action in "Top 3 things to fix first" must include a First step that is a single, concrete task a non-technical person can do themselves or ask someone to do this week. Not "implement multi-factor authentication" — say "Call your IT person and ask them to turn on two-step login for your email accounts. It takes about 10 minutes."
- Never describe a problem without saying what could actually happen to the business if it is not fixed.
- Keep every paragraph to 1–2 sentences maximum.
- Add a blank line between every paragraph and section.

Banned words and phrases — never use any of these. If you need the concept, describe it in plain words instead:
"threat vector", "attack surface", "remediate", "mitigate", "leverage", "stakeholders",
"vulnerability", "exploit", "patch", "endpoint", "authentication mechanism",
"encryption protocol", "zero-day", "penetration", "audit trail", "compliance framework",
"posture", "hygiene", "robust", "granular", "scalable", "holistic", "paradigm".

Write a security report with exactly these four sections in this exact order and exact headings:
## What this score means
## Your biggest risks right now
## Top 3 things to fix first
## What you're doing well

Formatting requirements (mandatory):
- Use markdown only.
- Under each ## section, include at least one ### subheading.
- Use **bold labels** for key terms (for example: **Risk level**, **Why it matters**, **First step this week**).
- Use numbered lists for ordered actions.
- Use bullet lists for supporting details.
- Keep paragraphs short (1–2 sentences per paragraph).
- Add a blank line between sections and paragraphs.
- Do not merge multiple ideas into one paragraph.
- Do not output plain text outside markdown structure.

Required structure template:
## What this score means
### Risk summary
- **Overall score:** <value>/100
- **Risk level:** <value>

### What this means for ${orgName}
<1–2 sentence plain English explanation of what this score means day-to-day for this type of business — no jargon>

## Your biggest risks right now
### Risk 1: <category name in plain words>
- **What could happen:** <one plain-English sentence describing the real consequence>
- **Real-world example:** <one sentence written as if it happened to a similar ${orgType}>

### Risk 2: <category name in plain words>
- **What could happen:** <one plain-English sentence describing the real consequence>
- **Real-world example:** <one sentence written as if it happened to a similar ${orgType}>

### Risk 3: <category name in plain words>
- **What could happen:** <one plain-English sentence describing the real consequence>
- **Real-world example:** <one sentence written as if it happened to a similar ${orgType}>

## Top 3 things to fix first
1. **<Action name in plain words>**
   - **Why it matters:** <one sentence — what bad thing does this prevent, in plain terms>
   - **First step this week:** <one concrete task a non-technical person can do or ask someone to do, with enough detail to actually act on it>

2. **<Action name in plain words>**
   - **Why it matters:** <one sentence — what bad thing does this prevent, in plain terms>
   - **First step this week:** <one concrete task a non-technical person can do or ask someone to do, with enough detail to actually act on it>

3. **<Action name in plain words>**
   - **Why it matters:** <one sentence — what bad thing does this prevent, in plain terms>
   - **First step this week:** <one concrete task a non-technical person can do or ask someone to do, with enough detail to actually act on it>

## What you're doing well
### Current strengths
- **<Strength in plain words>:** <one sentence explaining why this protects the business>
- **<Strength in plain words>:** <one sentence explaining why this protects the business>

---
**Your most important next step:** <One encouraging sentence telling them the single most important thing to do in the next 24 hours, written in plain, friendly language with no jargon.>

Style requirements:
- Tone: warm, direct, clear, human — like a trusted advisor, not a robot or a lawyer.
- Write for someone who is smart but has never worked in IT.
- Never talk down to them — be encouraging, not alarming.
- Keep language simple. If a 12-year-old would not understand a word, replace it.

Output requirements:
- Return markdown only and follow the required structure exactly.
- Do not add any heading before the first required heading.
- Do not add extra sections.`;
}

function extractSectionBodies(rawText) {
  const cleaned = normalizeWhitespace(rawText);
  if (!cleaned) return new Map();

  const sections = REPORT_HEADINGS.map((heading, idx) => {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const next = REPORT_HEADINGS[idx + 1]
      ? REPORT_HEADINGS[idx + 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      : null;
    const pattern = next
      ? new RegExp(`${escaped}\\s*([\\s\\S]*?)(?=${next})`, 'i')
      : new RegExp(`${escaped}\\s*([\\s\\S]*)$`, 'i');
    const match = cleaned.match(pattern);
    return {
      heading,
      body: normalizeWhitespace(match?.[1] || '')
    };
  });

  return new Map(sections.map((s) => [s.heading, s.body]));
}

function firstSentence(text, fallback) {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return fallback;
  const m = normalized.match(/(.+?[.!?])(?:\s|$)/);
  return m ? m[1].trim() : normalized;
}

function buildStructuredReport({ scores, tier, orgName, weakest, strongest, sectionBodies }) {
  const meaningBody = sectionBodies.get('## What this score means') || '';
  const risksBody = sectionBodies.get('## Your biggest risks right now') || '';
  const actionsBody = sectionBodies.get('## Top 3 things to fix first') || '';
  const strengthsBody = sectionBodies.get("## What you're doing well") || '';

  const riskLines = weakest.map((w, idx) => {
    const fallbackRisk = `${w.name} is underperforming and could lead to service disruption, account compromise, or data loss if left unresolved.`;
    const fallbackExample = `A similar organization delayed improvements in ${w.name} and later faced avoidable downtime and expensive recovery work.`;

    return `### Risk ${idx + 1}: ${w.name}\n- **What could happen:** ${firstSentence(risksBody, fallbackRisk)}\n- **Real-world example:** ${fallbackExample}`;
  });

  const topActions = [1, 2, 3].map((n) => {
    const fallbackAction = n === 1
      ? 'Turn on two-step login for email and admin accounts'
      : n === 2
        ? 'Apply pending security updates on all devices'
        : 'Run a short staff phishing-awareness briefing';
    const fallbackWhy = n === 1
      ? 'This prevents most account takeover attempts that start with stolen passwords.'
      : n === 2
        ? 'This closes known security gaps attackers commonly abuse.'
        : 'This reduces mistakes that lead to suspicious link clicks and credential leaks.';
    const fallbackStep = n === 1
      ? 'Ask your IT support to enable two-step login in your email admin panel this week.'
      : n === 2
        ? 'Create a checklist of all work devices and schedule updates over the next 7 days.'
        : 'Hold a 20-minute team session showing two examples of fake phishing emails.';

    return `${n}. **${fallbackAction}**\n   - **Why it matters:** ${firstSentence(actionsBody, fallbackWhy)}\n   - **First step this week:** ${fallbackStep}`;
  });

  const strengthBullets = strongest.map((s) => `- **${s.name}:** This is one of your stronger areas and helps reduce day-to-day security risk.`);
  const strengthsFallback = strengthBullets.length ? strengthBullets.join('\n') : '- **Assessment completion:** Finishing this assessment gives you a clear and practical action plan.';

  const meaningFallback = `${orgName} is currently at ${scores.pct}/100 (${tier.label} Risk), which means immediate improvement in a few priority areas can significantly reduce business risk.`;

  return [
    '## What this score means',
    '',
    '### Risk summary',
    `- **Overall score:** ${scores.pct}/100`,
    `- **Risk level:** ${tier.label}`,
    '',
    `### What this means for ${orgName}`,
    firstSentence(meaningBody, meaningFallback),
    '',
    '## Your biggest risks right now',
    '',
    riskLines.join('\n\n'),
    '',
    '## Top 3 things to fix first',
    '',
    topActions.join('\n\n'),
    '',
    "## What you're doing well",
    '',
    '### Current strengths',
    strengthsBody ? `- **Positive signal:** ${firstSentence(strengthsBody, 'You have useful strengths to build on as you improve weaker areas.')}` : strengthsFallback
  ].join('\n');
}

app.post('/api/ai-report', async (req, res) => {
  if (!openaiClient) {
    return res.status(503).json({ error: 'AI report service is not configured on this server.' });
  }

  const { scores, tier, orgName, orgType } = req.body;

  if (!scores || !tier || !orgName || !orgType) {
    return res.status(400).json({ error: 'scores, tier, orgName, and orgType are required.' });
  }

  const prompt = buildAiPrompt({ scores, tier, orgName, orgType });
  const { weakest, strongest } = buildReportContext({ scores });

  try {
    const response = await openaiClient.responses.create({
      model: OPENAI_MODEL,
      temperature: 0.2,
      max_output_tokens: 1000,
      input: prompt
    });

    const text = response.output_text || response.output?.[0]?.content?.[0]?.text || '';
    if (!normalizeWhitespace(text)) {
      return res.status(502).json({ error: 'AI service returned an empty report.' });
    }

    const sectionBodies = extractSectionBodies(text);
    const normalized = buildStructuredReport({
      scores,
      tier,
      orgName,
      weakest,
      strongest,
      sectionBodies
    });

    return res.json({
      report: normalized,
      format_enforced: true
    });
  } catch (error) {
    console.error('OpenAI API error:', error?.response?.data || error?.message || error);
    console.error('POST /api/ai-report error:', error);
    return res.status(502).json({ error: error?.message || 'AI report generation failed.' });
  }
});

// ─── FALLBACK HANDLERS ────────────────────────────────────────────
// fetch().json() never throws "Unexpected token '<'".
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

async function startServer() {
  try {
    await initializeDatabase();
    await testConnection();
    console.log('Connected to MySQL');

    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not start server:', error.message);
    process.exit(1);
  }
}

startServer();
