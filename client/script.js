/**
 * script.js — Cyber Risk Assessment Platform
 * Handles the questionnaire, API call, and dynamic rendering of
 * the dashboard and recommendations — all without page reloads.
 */

'use strict';

// ── Question definitions ─────────────────────────────────────────────────────
// Each object maps to a key the backend expects in the "answers" payload.
const QUESTIONS = [
  { key: 'mfa',              text: 'Do you use multi-factor authentication (MFA) on all critical accounts?' },
  { key: 'updates',          text: 'Are your operating systems and software regularly patched and updated?' },
  { key: 'backups',          text: 'Do you perform regular, tested data backups?' },
  { key: 'firewall',         text: 'Do you have a firewall protecting your network perimeter?' },
  { key: 'antivirus',        text: 'Is endpoint protection (antivirus / EDR) installed on all devices?' },
  { key: 'passwordPolicy',   text: 'Do you enforce a strong password policy across your organisation?' },
  { key: 'accessControl',    text: 'Do you implement role-based access control (least-privilege principle)?' },
  { key: 'incidentResponse', text: 'Do you have a documented and tested incident response plan?' },
  { key: 'securityTraining', text: 'Do employees receive regular cybersecurity awareness training?' },
  { key: 'encryption',       text: 'Is sensitive data encrypted both at rest and in transit?' },
];

// ── State ────────────────────────────────────────────────────────────────────
// Stores the user's current answers: { [questionKey]: "yes" | "no" | "partial" }
const state = {
  answers: {},
  result: null,   // populated after a successful API response
};

// ── DOM references ───────────────────────────────────────────────────────────
const questionsList    = document.getElementById('questionsList');
const progressFill     = document.getElementById('progressFill');
const progressLabel    = document.getElementById('progressLabel');
const submitBtn        = document.getElementById('submitBtn');
const submitHint       = document.getElementById('submitHint');
const loadingOverlay   = document.getElementById('loadingOverlay');
const errorToast       = document.getElementById('errorToast');
const errorMessage     = document.getElementById('errorMessage');
const toastClose       = document.getElementById('toastClose');
const dashboardTab     = document.getElementById('dashboardTab');
const recsTab          = document.getElementById('recsTab');

// Dashboard elements
const scoreValue       = document.getElementById('scoreValue');
const riskBadge        = document.getElementById('riskBadge');
const riskDescription  = document.getElementById('riskDescription');
const gaugePointer     = document.getElementById('gaugePointer');
const statsList        = document.getElementById('statsList');
const recsContainer    = document.getElementById('recsContainer');

// ── Initialise questionnaire ─────────────────────────────────────────────────
function renderQuestions() {
  questionsList.innerHTML = '';

  QUESTIONS.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.dataset.key = q.key;

    card.innerHTML = `
      <div class="question-meta">
        <span class="question-number">Q${idx + 1}</span>
        <span class="question-text">${q.text}</span>
      </div>
      <div class="answer-btns">
        <button class="answer-btn" data-value="yes"     aria-label="Yes">Yes</button>
        <button class="answer-btn" data-value="partial" aria-label="Partial">Partial</button>
        <button class="answer-btn" data-value="no"      aria-label="No">No</button>
      </div>
    `;

    // Attach click handler to each answer button
    card.querySelectorAll('.answer-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(q.key, btn.dataset.value, card));
    });

    questionsList.appendChild(card);
  });
}

// ── Handle answer selection ──────────────────────────────────────────────────
function handleAnswer(key, value, card) {
  state.answers[key] = value;

  // Update button styles within this card
  card.querySelectorAll('.answer-btn').forEach(btn => {
    btn.className = 'answer-btn';
    if (btn.dataset.value === value) {
      btn.classList.add(`selected-${value}`);
    }
  });

  // Mark card as answered
  card.classList.add('answered');

  updateProgress();
}

// ── Update progress bar ──────────────────────────────────────────────────────
function updateProgress() {
  const answered = Object.keys(state.answers).length;
  const total    = QUESTIONS.length;
  const pct      = Math.round((answered / total) * 100);

  progressFill.style.width = `${pct}%`;
  progressLabel.textContent = `${answered} / ${total} answered`;

  const allAnswered = answered === total;
  submitBtn.disabled = !allAnswered;
  submitHint.textContent = allAnswered
    ? 'All questions answered — ready to submit!'
    : `Please answer all questions to continue. (${total - answered} remaining)`;
}

// ── Submit questionnaire ─────────────────────────────────────────────────────
submitBtn.addEventListener('click', async () => {
  if (Object.keys(state.answers).length < QUESTIONS.length) return;

  showLoading(true);

  try {
    const response = await fetch('/api/assess', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ answers: state.answers }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    state.result = data;
    showLoading(false);

    // Unlock tabs and navigate to dashboard
    enableResultTabs();
    navigateTo('dashboard');
    renderDashboard(data);
    renderRecommendations(data.recommendations);

  } catch (err) {
    showLoading(false);
    showError(err.message || 'Failed to connect to the server. Please try again.');
  }
});

// ── Render dashboard ─────────────────────────────────────────────────────────
function renderDashboard({ score, riskLevel }) {
  const level = riskLevel.toLowerCase(); // "low" | "medium" | "high"

  // Score number
  scoreValue.textContent = score;
  scoreValue.className   = `score-value score-${level}`;

  // Risk badge
  riskBadge.textContent = riskLevel;
  riskBadge.className   = `risk-badge ${level}`;

  // Friendly description
  const descriptions = {
    low:    'Your organisation has a strong security posture. Keep maintaining best practices.',
    medium: 'Several security gaps exist. Address the recommendations to reduce your exposure.',
    high:   'Critical vulnerabilities detected. Immediate action is strongly recommended.',
  };
  riskDescription.textContent = descriptions[level] || '';

  // Gauge pointer position (0 % left → 100 % left corresponds to score 0–100)
  gaugePointer.style.left = `${score}%`;

  // Answer summary (Yes / Partial / No counts)
  const counts = { yes: 0, partial: 0, no: 0 };
  Object.values(state.answers).forEach(v => { counts[v] = (counts[v] || 0) + 1; });

  statsList.innerHTML = `
    <li><span>✅ Yes (secure)</span>   <span class="stat-count stat-yes">${counts.yes}</span></li>
    <li><span>⚠️ Partial</span>        <span class="stat-count stat-partial">${counts.partial}</span></li>
    <li><span>❌ No (at risk)</span>   <span class="stat-count stat-no">${counts.no}</span></li>
  `;
}

// ── Render recommendations ───────────────────────────────────────────────────
function renderRecommendations({ high = [], medium = [], low = [] }) {
  const totalRecs = high.length + medium.length + low.length;

  if (totalRecs === 0) {
    recsContainer.innerHTML = `
      <div class="all-clear">
        <div class="all-clear-icon">🎉</div>
        <h2>Excellent Security Posture!</h2>
        <p>No critical recommendations at this time. Continue monitoring your environment regularly.</p>
      </div>`;
    return;
  }

  recsContainer.innerHTML = '';

  const groups = [
    { key: 'high',   label: 'High Priority',   items: high   },
    { key: 'medium', label: 'Medium Priority',  items: medium },
    { key: 'low',    label: 'Low Priority',     items: low    },
  ];

  groups.forEach(({ key, label, items }) => {
    if (items.length === 0) return;

    const group = document.createElement('div');
    group.className = 'priority-group';
    group.innerHTML = `
      <h2 class="priority-heading">
        <span class="priority-dot ${key}"></span>
        ${label} <span style="color:var(--clr-text-muted);font-weight:400;font-size:.9rem;">(${items.length})</span>
      </h2>
      <div class="rec-cards">
        ${items.map(rec => `
          <div class="rec-card ${key}">
            <div class="rec-card-title">${rec.title}</div>
            <div class="rec-card-explanation">${rec.explanation}</div>
          </div>`).join('')}
      </div>
    `;
    recsContainer.appendChild(group);
  });
}

// ── Tab navigation ───────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    navigateTo(btn.dataset.tab);
  });
});

function navigateTo(tabId) {
  // Update active tab button
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });
  // Show the matching panel
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });
  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function enableResultTabs() {
  dashboardTab.disabled = false;
  recsTab.disabled      = false;
}

// ── "View Recommendations" button (on dashboard) ─────────────────────────────
document.getElementById('viewRecsBtn').addEventListener('click', () => {
  navigateTo('recommendations');
});

// ── "Retake Assessment" buttons ──────────────────────────────────────────────
function resetAssessment() {
  state.answers = {};
  state.result  = null;

  // Reset question cards
  document.querySelectorAll('.question-card').forEach(card => {
    card.classList.remove('answered');
    card.querySelectorAll('.answer-btn').forEach(btn => { btn.className = 'answer-btn'; });
  });

  // Reset progress bar
  progressFill.style.width = '0%';
  progressLabel.textContent = `0 / ${QUESTIONS.length} answered`;
  submitBtn.disabled = true;
  submitHint.textContent = 'Please answer all questions to continue.';

  // Disable result tabs and go back to questionnaire
  dashboardTab.disabled = true;
  recsTab.disabled      = true;
  navigateTo('questionnaire');
}

document.getElementById('retakeBtn').addEventListener('click',  resetAssessment);
document.getElementById('retakeBtn2').addEventListener('click', resetAssessment);

// ── Loading overlay helpers ──────────────────────────────────────────────────
function showLoading(visible) {
  loadingOverlay.hidden = !visible;
}

// ── Error toast helpers ──────────────────────────────────────────────────────
function showError(msg) {
  errorMessage.textContent = msg;
  errorToast.hidden = false;

  // Auto-dismiss after 6 s
  setTimeout(hideError, 6000);
}

function hideError() {
  errorToast.hidden = true;
}

toastClose.addEventListener('click', hideError);

// ── Bootstrap ────────────────────────────────────────────────────────────────
renderQuestions();
