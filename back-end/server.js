const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

dotenv.config();

const { pool, initializeDatabase, testConnection } = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const API_USERNAME = process.env.API_USERNAME || 'demo';
const API_PASSWORD = process.env.API_PASSWORD || 'demo123';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

app.use(cors());
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

    if (username !== API_USERNAME || password !== API_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, token_type: 'Bearer', expires_in: JWT_EXPIRES_IN });
  } catch (error) {
    console.error('POST /api/auth/token error:', error);
    return res.status(500).json({ error: 'Failed to create token' });
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

app.post('/api/assessment', requireJwt, async (req, res) => {
  try {
    const { org_name, org_type, answers, score, risk_level } = req.body;

    if (!org_name || !org_type || !answers || score === undefined || !risk_level) {
      return res.status(400).json({
        error: 'Missing required fields: org_name, org_type, answers, score, risk_level'
      });
    }

    const insertSql = `
      INSERT INTO assessments (org_name, org_type, answers, score, risk_level)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(insertSql, [
      org_name,
      org_type,
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

app.get('/api/assessment/:id', requireJwt, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid assessment id' });
    }

    const [rows] = await pool.execute(
      'SELECT id, org_name, org_type, answers, score, risk_level, created_at FROM assessments WHERE id = ?',
      [id]
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
