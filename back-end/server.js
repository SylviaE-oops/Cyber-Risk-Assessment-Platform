const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

dotenv.config();

const { pool, initializeDatabase, testConnection } = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
const BCRYPT_ROUNDS = 10;

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

      if (!username || !password || !confirmPassword || !org_name || !org_type) {
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Insert new user
    const [result] = await pool.execute(
        'INSERT INTO users (email, password, org_name, org_type) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, org_name, org_type]
    );

    const token = jwt.sign({ username, userId: result.insertId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(201).json({ 
      token, 
      token_type: 'Bearer', 
      expires_in: JWT_EXPIRES_IN,
        user: { username, org_name, org_type },
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

app.get('/api/users', requireJwt, async (_req, res) => {

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
