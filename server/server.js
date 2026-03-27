/**
 * server.js
 * Entry point for the Cyber Risk Assessment Platform backend.
 *
 * Start the server:
 *   npm install
 *   node server/server.js
 *
 * The server serves the static frontend from /client and exposes
 * the REST API under /api.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const assessmentRoutes = require('./routes/assessmentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
// Parse JSON request bodies
app.use(express.json());

// Allow cross-origin requests (useful during local development)
app.use(cors());

// Serve static frontend files from the /client directory
app.use(express.static(path.join(__dirname, '../client')));

// ---------- API Routes ----------
app.use('/api', assessmentRoutes);

// ---------- Fallback: serve index.html for any non-API route ----------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`\n🛡️  Cyber Risk Assessment Platform`);
  console.log(`   Server running at http://localhost:${PORT}\n`);
});

module.exports = app; // exported for testing
