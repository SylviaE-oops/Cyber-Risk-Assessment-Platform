// ─── QUESTION BANK ───────────────────────────────────────────────
const QUESTIONS = [
  // Access Control (max 18)
  { id:1, cat:'Access Control', catIdx:0, text:'Do employees use two-step verification (like a code sent to their phone) when logging into work accounts?', framework:'CIS 6.3 / NIST PR.AC-7 — Implement MFA', options:[{label:'Yes, for all accounts',pts:4},{label:'Only for some accounts',pts:2},{label:'No',pts:0}] },
  { id:2, cat:'Access Control', catIdx:0, text:'Are old employee accounts deleted or disabled within 24 hours after someone leaves?', framework:'CIS 5.3 / NIST PR.AC-1 — Disable inactive accounts', options:[{label:'Yes, always',pts:4},{label:'Sometimes, but not consistently',pts:2},{label:'No',pts:0}] },
  { id:3, cat:'Access Control', catIdx:0, text:'Do employees only have access to the files and systems they actually need for their job?', framework:'CIS 5.4 / NIST PR.AC-4 — Least privilege', options:[{label:'Yes, access is tightly controlled',pts:4},{label:'Somewhat — some have more than needed',pts:2},{label:'No, most can access everything',pts:0}] },
  { id:4, cat:'Access Control', catIdx:0, text:'Does your organization require strong passwords (at least 12 characters, with numbers and symbols)?', framework:'CIS 5.2 / NIST PR.AC-1 — Strong password policy', options:[{label:'Yes, enforced by policy',pts:3},{label:'Encouraged but not enforced',pts:1},{label:'No requirement',pts:0}] },
  { id:5, cat:'Access Control', catIdx:0, text:'Is there a list of who has admin (super-user) access, and is it reviewed regularly?', framework:'CIS 5.1 / NIST PR.AC-6 — Privileged account management', options:[{label:'Yes, reviewed at least quarterly',pts:3},{label:'A list exists but rarely reviewed',pts:1},{label:'No',pts:0}] },
  // Data Protection (max 17)
  { id:6, cat:'Data Protection', catIdx:1, text:'Does your organization back up important data, and have you tested that the backup can actually be restored?', framework:'CIS 11.1 / NIST PR.IP-4 — Implement and test backups', options:[{label:'Yes, backups exist and have been tested',pts:4},{label:'Backups exist but never tested',pts:2},{label:'No backups',pts:0}] },
  { id:7, cat:'Data Protection', catIdx:1, text:'Is sensitive data (like customer info or financial records) encrypted when stored or sent over the internet?', framework:'CIS 3.6 / NIST PR.DS-1 — Encrypt data at rest and in transit', options:[{label:'Yes, both at rest and in transit',pts:4},{label:'Only one of the two',pts:2},{label:'No encryption',pts:0}] },
  { id:8, cat:'Data Protection', catIdx:1, text:'Does your organization have a list of what sensitive data you hold and where it is stored?', framework:'CIS 3.1 / NIST ID.AM-5 — Data inventory', options:[{label:'Yes, a complete inventory',pts:3},{label:'We know roughly but no formal list',pts:1},{label:'No',pts:0}] },
  { id:9, cat:'Data Protection', catIdx:1, text:'Are employees trained on how to handle sensitive information (e.g., not emailing passwords or personal data)?', framework:'CIS 14.1 / NIST PR.AT-1 — Data handling training', options:[{label:'Yes, formal training provided',pts:3},{label:'Informal guidance only',pts:1},{label:'No training',pts:0}] },
  { id:10, cat:'Data Protection', catIdx:1, text:'When employees leave, are their devices wiped and accounts removed before they walk out?', framework:'CIS 2.7 / NIST PR.DS-3 — Sanitize on offboarding', options:[{label:'Yes, every time',pts:3},{label:'Usually, but not always',pts:1},{label:'No process in place',pts:0}] },
  // Device & Network (max 15)
  { id:11, cat:'Device & Network Security', catIdx:2, text:'Are software updates and security patches applied to all devices within two weeks of release?', framework:'CIS 7.3 / NIST PR.IP-12 — Timely patching', options:[{label:'Yes, within two weeks',pts:4},{label:'Eventually, but often delayed',pts:2},{label:'No regular updates',pts:0}] },
  { id:12, cat:'Device & Network Security', catIdx:2, text:'Is there a separate Wi-Fi network for guests or personal devices, separate from your main work network?', framework:'CIS 12.2 / NIST PR.AC-5 — Network segmentation', options:[{label:'Yes, completely separate',pts:3},{label:'Partially separated',pts:1},{label:'No, one network for everyone',pts:0}] },
  { id:13, cat:'Device & Network Security', catIdx:2, text:'Do all work computers and devices have antivirus or security software installed and up to date?', framework:'CIS 10.1 / NIST DE.CM-4 — Endpoint protection', options:[{label:'Yes, on all devices',pts:3},{label:'On most devices',pts:1},{label:'No',pts:0}] },
  { id:14, cat:'Device & Network Security', catIdx:2, text:'Does your organization have a list of all devices (computers, phones, printers) that connect to your network?', framework:'CIS 1.1 / NIST ID.AM-1 — Hardware asset inventory', options:[{label:'Yes, a complete list',pts:3},{label:'Partial list',pts:1},{label:'No inventory',pts:0}] },
  { id:15, cat:'Device & Network Security', catIdx:2, text:'Is your office Wi-Fi password-protected with a modern encryption standard (WPA2 or WPA3)?', framework:'CIS 12.3 / NIST PR.PT-4 — Secure wireless configuration', options:[{label:'Yes, WPA2 or WPA3',pts:2},{label:'Older encryption or unsure',pts:1},{label:'No password',pts:0}] },
  // Incident Response (max 16)
  { id:16, cat:'Incident Response', catIdx:3, text:'Does your organization have a written plan for what to do if you get hacked or experience a data breach?', framework:'CIS 17.1 / NIST RS.RP-1 — Incident response plan', options:[{label:'Yes, written and tested',pts:4},{label:'Written but never tested',pts:2},{label:'No plan',pts:0}] },
  { id:17, cat:'Incident Response', catIdx:3, text:'Do employees know who to contact and what steps to take if they receive a suspicious email or think they\'ve been hacked?', framework:'CIS 17.3 / NIST RS.CO-2 — Incident reporting procedures', options:[{label:'Yes, clear process everyone knows',pts:4},{label:'Some people know, others don\'t',pts:2},{label:'No process',pts:0}] },
  { id:18, cat:'Incident Response', catIdx:3, text:'Does your organization log who accesses systems and review those logs for anything unusual?', framework:'CIS 8.2 / NIST DE.CM-3 — Audit log review', options:[{label:'Yes, logs exist and are reviewed',pts:3},{label:'Logs exist but never reviewed',pts:1},{label:'No logging',pts:0}] },
  { id:19, cat:'Incident Response', catIdx:3, text:'Has your team done any security drills or simulations (like a fake phishing test) in the past year?', framework:'CIS 17.6 / NIST RS.IM-1 — Test response capabilities', options:[{label:'Yes, at least once this year',pts:3},{label:'Not in over a year',pts:1},{label:'Never',pts:0}] },
  { id:20, cat:'Incident Response', catIdx:3, text:'Does your organization know who to contact externally in a security emergency (e.g., your internet provider, law enforcement, insurance)?', framework:'CIS 17.2 / NIST RS.CO-3 — External contacts', options:[{label:'Yes, contacts are documented',pts:2},{label:'Partially — know some, not all',pts:1},{label:'No',pts:0}] },
  // Security Awareness (max 14)
  { id:21, cat:'Security Awareness', catIdx:4, text:'Has your organization provided cybersecurity training to all staff in the past 12 months?', framework:'CIS 14.1 / NIST PR.AT-1 — Security awareness training', options:[{label:'Yes, all staff trained',pts:4},{label:'Some staff trained',pts:2},{label:'No training',pts:0}] },
  { id:22, cat:'Security Awareness', catIdx:4, text:'Can employees recognize the signs of a phishing email (fake emails that try to steal your login)?', framework:'CIS 14.2 / NIST PR.AT-1 — Phishing awareness', options:[{label:'Yes, trained and tested',pts:3},{label:'Aware but never formally trained',pts:1},{label:'No awareness',pts:0}] },
  { id:23, cat:'Security Awareness', catIdx:4, text:'Is there a clear policy on what employees can and cannot do with company devices (e.g., no installing unapproved software)?', framework:'CIS 2.5 / NIST PR.IP-11 — Acceptable use policy', options:[{label:'Yes, written policy in place',pts:3},{label:'Informal rules but nothing written',pts:1},{label:'No policy',pts:0}] },
  { id:24, cat:'Security Awareness', catIdx:4, text:'Does leadership actively support and participate in cybersecurity practices?', framework:'CIS 17.1 / NIST GV.OC-1 — Governance and leadership buy-in', options:[{label:'Yes, leadership champions it',pts:2},{label:'Somewhat — not a priority',pts:1},{label:'No',pts:0}] },
  { id:25, cat:'Security Awareness', catIdx:4, text:'Does your organization use a password manager so employees don\'t reuse or write down passwords?', framework:'CIS 5.2 / NIST PR.AC-1 — Password managers', options:[{label:'Yes, org-wide password manager',pts:2},{label:'Some people use one personally',pts:1},{label:'No',pts:0}] },
];

const CAT_MAX = [18, 17, 15, 16, 14];
const CAT_NAMES = ['Access Control','Data Protection','Device & Network','Incident Response','Security Awareness'];
const PROGRESS_KEY = 'cyberposture_progress_v1';
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN_KEY = 'cyberposture_jwt_token';
const ANTHROPIC_API_KEY = window.ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key') || '';
const APP_PARAMS = new URLSearchParams(window.location.search);

// State
let currentQ = 0; // 0 = setup, 1-25 = questions
let answers = {}; // { questionId: pts }
let orgName = '';
let orgType = '';
let assessmentMode = 'one-time'; // 'one-time' | 'tracked'
let isSubmitting = false;
let latestReportData = null;

// ─── BUILD QUESTION SCREENS ───────────────────────────────────────
function buildScreens() {
  const container = document.getElementById('questionScreens');
  container.innerHTML = '';
  QUESTIONS.forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'q-screen';
    div.id = 'screen-q' + idx;
    div.innerHTML = `
      <div class="q-card">
        <div class="q-category">${q.cat}</div>
        <div class="q-text">${q.text}</div>
        <div class="q-framework">${q.framework}</div>
        <div class="options" id="opts-${idx}">
          ${q.options.map((o,oi) => `
            <button class="option-btn" onclick="selectOption(${idx},${oi},${o.pts})" id="opt-${idx}-${oi}">
              <div class="option-dot"></div>
              <span class="option-text">${o.label}</span>
              <span class="option-pts">${o.pts} pt${o.pts!==1?'s':''}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="nav-row">
        <button class="btn-back" onclick="goBack(${idx})">&#8592; Back</button>
        <button class="btn-next" id="next-${idx}" onclick="goNext(${idx})" disabled>
          ${idx < QUESTIONS.length-1 ? 'Next &#8594;' : 'Submit assessment'}
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

function selectOption(qIdx, optIdx, pts) {
  const q = QUESTIONS[qIdx];
  answers[q.id] = pts;
  // Update UI
  q.options.forEach((_,i) => {
    document.getElementById('opt-'+qIdx+'-'+i).classList.toggle('selected', i===optIdx);
  });
  document.getElementById('next-'+qIdx).disabled = false;
  persistProgress();
}

async function checkOrganizationAvailability(orgNameToCheck, orgTypeToCheck) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/org/availability`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ org_name: orgNameToCheck, org_type: orgTypeToCheck })
  });

  if (!response.ok) {
    let errMsg = 'Could not verify organization availability right now.';
    try { const d = await response.json(); errMsg = d.error || errMsg; } catch { /* non-JSON body */ }
    throw new Error(errMsg);
  }

  return response.json();
}

async function startAssessment() {
  const enteredName = document.getElementById('orgName').value.trim();
  const enteredType = document.getElementById('orgType').value;

  if (!enteredName) {
    alert('Please enter your organization name before starting.');
    document.getElementById('orgName').focus();
    return false;
  }

  const selectedMode = document.querySelector('input[name="assessmentMode"]:checked')?.value || 'one-time';
  if (selectedMode === 'tracked' && !localStorage.getItem(AUTH_TOKEN_KEY)) {
    if (typeof openLoginModal === 'function') {
      openLoginModal();
    }
    alert('Please sign in to use tracked mode and view progress on the dashboard.');
    return false;
  }

  try {
    const orgStatus = await checkOrganizationAvailability(enteredName, enteredType);
    if (orgStatus.claimed && !orgStatus.ownedByCurrentUser) {
      alert('This organization name is already used by a registered account. Please sign in with that account to continue.');
      if (typeof openLoginModal === 'function') {
        openLoginModal();
      }
      return false;
    }
  } catch (error) {
    alert(error.message || 'Could not verify organization availability right now. Please try again.');
    return false;
  }

  assessmentMode = selectedMode;
  orgName = enteredName;
  orgType = enteredType;
  persistProgress();
  showScreen('q', 0);
  return true;
}

function goNext(qIdx) {
  if (qIdx < QUESTIONS.length-1) {
    showScreen('q', qIdx+1);
  } else {
    submitAssessment();
  }
}

function goBack(qIdx) {
  if (qIdx === 0) {
    if (shouldReturnToDashboardOnFirstBack()) {
      const shouldLeave = window.confirm(
        'Are you sure you want to leave this assessment and return to the dashboard?'
      );
      if (!shouldLeave) {
        return;
      }
      window.location.href = 'cyberriskdashboard.html';
      return;
    }
    showScreen('setup');
    return;
  }
  else showScreen('q', qIdx-1);
}

function shouldReturnToDashboardOnFirstBack() {
  const isDashboardFlow = APP_PARAMS.get('start') === 'questions' || APP_PARAMS.get('return') === 'dashboard';
  const hasAuthToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  return isDashboardFlow && hasAuthToken;
}

function showScreen(type, idx) {
  // Hide all
  document.getElementById('screen-setup').classList.remove('active');
  document.querySelectorAll('.q-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('savingScreen').classList.remove('active');
  document.getElementById('resultsScreen').classList.remove('active');

  if (type === 'setup') {
    document.getElementById('screen-setup').classList.add('active');
    updateProgress(0, 'Getting started');
    currentQ = 0;
  } else if (type === 'q') {
    document.getElementById('screen-q'+idx).classList.add('active');
    const pct = Math.round(((idx+1)/QUESTIONS.length)*95);
    updateProgress(pct, `Question ${idx+1} of ${QUESTIONS.length} — ${QUESTIONS[idx].cat}`);
    currentQ = idx;
  } else if (type === 'saving') {
    document.getElementById('savingScreen').classList.add('active');
    updateProgress(96, 'Processing results...');
  } else if (type === 'results') {
    document.getElementById('resultsScreen').classList.add('active');
    updateProgress(100, 'Assessment complete');
    clearProgress();
  }
}

function updateProgress(pct, label) {
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = label;
  document.getElementById('progressPct').textContent = pct + '%';
}

// ─── SCORING ─────────────────────────────────────────────────────
function calcScores() {
  const cats = [0,0,0,0,0];
  QUESTIONS.forEach(q => {
    const pts = answers[q.id] ?? 0;
    cats[q.catIdx] += pts;
  });
  const total = cats.reduce((a,b)=>a+b,0);
  const pct = Math.round((total/80)*100);
  return { cats, total, pct };
}

function getRiskTier(pct) {
  if (pct < 40) return { label:'Critical', cls:'risk-critical', color:'#ff4d6d', desc:'Major gaps across most security categories. Immediate action is needed to protect your organization.' };
  if (pct < 60) return { label:'High', cls:'risk-high', color:'#ff8c42', desc:'Several significant weaknesses present. A focused 30-day improvement plan is recommended.' };
  if (pct < 75) return { label:'Medium', cls:'risk-medium', color:'#ffd166', desc:'The basics are covered but notable gaps remain in key areas that need attention.' };
  return { label:'Low', cls:'risk-low', color:'#00e5a0', desc:'Strong security posture overall. Focus on hardening the remaining weak areas.' };
}

function getBarColor(pct) {
  if (pct < 40) return '#ff4d6d';
  if (pct < 60) return '#ff8c42';
  if (pct < 75) return '#ffd166';
  return '#00e5a0';
}

// ─── BACKEND API ───────────────────────────────────────────────────
async function saveToDatabase(record) {
  const REQUEST_TIMEOUT_MS = 15000;

  if (assessmentMode === 'one-time') {
    const timeout = timeoutSignal(REQUEST_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/assessment/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record),
        signal: timeout.signal
      });
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('Saving timed out. Please try again.');
      }
      throw error;
    } finally {
      timeout.clear();
    }

    if (!response.ok) {
      let errMsg = 'Could not save one-time assessment';
      try { const d = await response.json(); errMsg = d.error || errMsg; } catch { /* non-JSON error body */ }
      throw new Error(errMsg);
    }
    const data = await response.json();
    return { id: data.id, mode: 'one-time' };
  }

  const token = await getAuthToken();

  const timeout = timeoutSignal(REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(record),
      signal: timeout.signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Saving timed out. Please try again.');
    }
    throw error;
  } finally {
    timeout.clear();
  }

  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    throw new Error('Unauthorized. Could not validate JWT token.');
  }

  if (!response.ok) {
    let errMsg = 'Could not save assessment';
    try { const d = await response.json(); errMsg = d.error || errMsg; } catch { /* non-JSON error body */ }
    throw new Error(errMsg);
  }
  const data = await response.json();

  return { id: data.id, mode: 'tracked' };
}

async function getAuthToken() {
  const cached = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!cached) throw new Error('Not signed in');
  return cached;
}

// ─── AI AGENT ────────────────────────────────────────────────────
async function runAIAgent(scores, tier, orgName, orgType) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}/api/ai-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ scores, tier, orgName, orgType })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API error');
  return data.report || '';
}

// ─── SUBMIT FLOW ─────────────────────────────────────────────────
async function submitAssessment() {
  if (isSubmitting) return;
  isSubmitting = true;
  showScreen('saving');

  // Reset visual state for repeat runs.
  [1,2,3,4].forEach(step => setStep(step, ''));

  const scores = calcScores();
  const tier = getRiskTier(scores.pct);

  // Step 1: Score
  setStep(1, 'active');
  updateProgress(97, 'Scoring your responses...');
  await delay(600);
  setStep(1, 'done');

  // Step 2: Save to DB (skipped silently if not signed in)
  setStep(2, 'active');
  updateProgress(98, 'Saving your assessment...');
  const record = {
    org_name: orgName,
    org_type: orgType,
    answers,
    score: scores.pct,
    risk_level: tier.label
  };
  let saveResult = null;
  try {
    saveResult = await saveToDatabase(record);
  } catch (error) {
    console.error('Save failed:', error);
    if (assessmentMode === 'tracked' && typeof openLoginModal === 'function') {
      openLoginModal();
    }
    alert(error.message || 'Could not save assessment to the server.');

    // Continue in guest mode so report generation can still complete.
    saveResult = { id: null, mode: 'one-time' };
    setStep(2, '');
  }

  // Step 3: AI Agent
  setStep(3, 'active');
  updateProgress(99, 'Generating your report...');
  let aiReport = '';
  try {
    aiReport = await runAIAgent(scores, tier, orgName, orgType);
  } catch (e) {
    console.warn('AI report unavailable.', e);
    aiReport = `Stop this is the back up: ## What this score means\n\n${orgName} scored **${scores.pct}/100** — ${tier.label} Risk. ${tier.desc}\n\n## Your biggest risks right now\n\nThe areas that need the most attention are your lowest-scoring categories. Focus on those first to reduce your overall risk quickly.\n\n## Top 3 things to fix first\n\n1. **Enable two-step login** on all admin and email accounts — this blocks the most common types of account takeover.\n2. **Keep devices up to date** — apply software updates within two weeks of release to close known security gaps.\n3. **Train your staff** — run a short session so everyone knows how to spot a suspicious email.\n\n## What you're doing well\n\nCompleting this assessment is a strong first step. Use your scores above to prioritize where to start.`;
  }
  setStep(3, 'done');

  // Step 4: Build report
  setStep(4, 'active');
  await delay(400);
  setStep(4, 'done');

  await delay(300);
  showResults(scores, tier, aiReport, saveResult.id, saveResult.mode);
  isSubmitting = false;
}

function showResults(scores, tier, aiReport, recordId, mode) {
  // Store data for PDF export
  latestReportData = {
    orgName,
    orgType,
    score: scores.pct,
    riskLabel: tier.label,
    catScores: scores.cats,
    aiReport: aiReport || '',
    recordId,
    mode,
    generatedAt: Date.now()
  };

  // Populate score hero
  document.getElementById('bigScore').textContent = scores.pct;
  const badge = document.getElementById('riskBadge');
  badge.textContent = tier.label + ' Risk';
  badge.className = 'risk-badge ' + tier.cls;
  document.getElementById('scoreDesc').textContent = tier.desc;

  // Category bars
  CAT_NAMES.forEach((_, i) => {
    const pct = Math.round((scores.cats[i] / CAT_MAX[i]) * 100);
    const fill = document.getElementById('cf' + (i + 1));
    const label = document.getElementById('cp' + (i + 1));
    if (fill) { fill.style.width = pct + '%'; fill.style.background = getBarColor(pct); }
    if (label) label.textContent = pct + '%';
  });

  // DB note
  const dbNote = document.getElementById('dbNote');
  if (dbNote) {
    dbNote.textContent = mode === 'tracked'
      ? `Assessment saved — Record #${recordId}`
      : 'Guest assessment — sign in to track results over time';
  }

  // PDF button visibility
  togglePdfButton(mode);

  // Show results screen then stream report text
  showScreen('results');
  streamReport(aiReport);
}

function setStep(n, state) {
  const el = document.getElementById('step'+n);
  el.className = ('step-row ' + state).trim();
  if (state === 'done') el.querySelector('.step-icon').textContent = '✓';
  else if (state === 'active') el.querySelector('.step-icon').textContent = '';
  else el.querySelector('.step-icon').textContent = String(n);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer)
  };
}

function togglePdfButton(mode) {
  const btn = document.getElementById('downloadPdfBtn');
  if (!btn) return;
  btn.style.display = mode === 'tracked' ? 'inline-flex' : 'none';
}

function sanitizeFileSegment(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'organization';
}

function toPlainTextFromMarkdown(text) {
  return String(text || '')
    .replace(/^##\s+/gm, '')
    .replace(/^[-*]\s+/gm, '- ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\r/g, '')
    .trim();
}

function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * lineHeight);
}

async function saveReportPdfToDatabase(assessmentId, fileName, pdfBase64) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/assessment/${assessmentId}/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      file_name: fileName,
      pdf_base64: pdfBase64
    })
  });

  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    throw new Error('Session expired. Please sign in again to save the PDF.');
  }

  if (!response.ok) {
    let errMsg = 'Could not save PDF to your account.';
    try { const d = await response.json(); errMsg = d.error || errMsg; } catch { /* non-JSON body */ }
    throw new Error(errMsg);
  }

  return response.json();
}

function downloadCurrentReportPdf() {
  if (!latestReportData) {
    alert('No report data available yet. Please complete an assessment first.');
    return;
  }

  const jsPdfNamespace = window.jspdf;
  if (!jsPdfNamespace || !jsPdfNamespace.jsPDF) {
    alert('PDF tool is not loaded. Please refresh the page and try again.');
    return;
  }

  const { jsPDF } = jsPdfNamespace;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 44;
  const MR = 44;
  const CW = PW - ML - MR;
  const BM = 52;

  const C = {
    navy: [27, 42, 74],
    teal: [10, 126, 106],
    tealLight: [230, 244, 241],
    amber: [180, 83, 9],
    amberLight: [254, 243, 199],
    red: [185, 28, 28],
    redLight: [254, 226, 226],
    green: [21, 128, 61],
    greenLight: [220, 252, 231],
    gray1: [248, 249, 250],
    gray2: [226, 232, 240],
    gray3: [107, 114, 128],
    black: [17, 24, 39],
    white: [255, 255, 255],
  };

  function riskColor(pct) {
    if (pct >= 75) return C.green;
    if (pct >= 60) return C.teal;
    if (pct >= 40) return C.amber;
    return C.red;
  }

  function riskWord(pct) {
    if (pct >= 75) return 'Strong';
    if (pct >= 60) return 'Moderate';
    if (pct >= 40) return 'Needs Work';
    return 'Critical';
  }

  function riskLabel(pct) {
    if (pct < 40) return 'Critical';
    if (pct < 60) return 'High';
    if (pct < 75) return 'Medium';
    return 'Low';
  }

  function setFill(c) { doc.setFillColor(c[0], c[1], c[2]); }
  function setStroke(c) { doc.setDrawColor(c[0], c[1], c[2]); }
  function setText(c) { doc.setTextColor(c[0], c[1], c[2]); }

  function wrap(text, x, y, maxWidth, lh) {
    const lines = doc.splitTextToSize(String(text || ''), maxWidth);
    lines.forEach((line) => {
      doc.text(line, x, y);
      y += lh;
    });
    return y;
  }

  function ensureSpace(y, needed) {
    if (y + needed <= PH - BM) return y;
    doc.addPage();
    return 56;
  }

  function drawSectionTitle(y, text) {
    y = ensureSpace(y, 32);
    setText(C.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(text, ML, y);
    setFill(C.navy);
    doc.rect(ML, y + 6, 36, 1.6, 'F');
    return y + 18;
  }

  const orgName = latestReportData.orgName || 'Your Organization';
  const orgType = latestReportData.orgType || 'Small Business';
  const score = Number(latestReportData.score || 0);
  const rLabel = latestReportData.riskLabel || riskLabel(score);
  const dateStr = new Date(latestReportData.generatedAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const reportId = latestReportData.recordId || Math.floor(Date.now() / 1000);

  const catRows = (latestReportData.categoryRows || CAT_NAMES.map((name, i) => ({
    name,
    percent: Math.round(((latestReportData.catScores?.[i] || 0) / CAT_MAX[i]) * 100),
  }))).map((r) => ({
    name: r.name,
    percent: Number(r.percent) || 0,
  }));

  const weakest = [...catRows].sort((a, b) => a.percent - b.percent).slice(0, 3);
  const strongest = [...catRows].sort((a, b) => b.percent - a.percent)[0] || { name: 'N/A', percent: 0 };
  const aiSummary = toPlainTextFromMarkdown(latestReportData.aiReport);

  function categoryAction(catName) {
    if (/Access Control/i.test(catName)) {
      return {
        action: 'Enable two-step login for admin and email accounts',
        owner: 'IT Lead',
        due: '7 days',
        impact: 'High - blocks common account takeovers',
      };
    }
    if (/Data Protection/i.test(catName)) {
      return {
        action: 'Test backup restore and assign data control owners',
        owner: 'IT Lead',
        due: '14 days',
        impact: 'High - reduces data loss and recovery time',
      };
    }
    if (/Device/i.test(catName)) {
      return {
        action: 'Patch critical systems and verify endpoint protection',
        owner: 'IT Support',
        due: '14 days',
        impact: 'High - reduces exploit and malware risk',
      };
    }
    if (/Incident/i.test(catName)) {
      return {
        action: 'Publish incident checklist and escalation contacts',
        owner: 'Operations Manager',
        due: '21 days',
        impact: 'Medium-High - speeds response and reduces downtime',
      };
    }
    return {
      action: 'Run 30-minute staff security awareness session',
      owner: 'Operations Manager',
      due: '21 days',
      impact: 'Medium - lowers phishing and human-error incidents',
    };
  }

  let y = 56;

  // Cover/Header
  setFill(C.navy);
  doc.roundedRect(ML, y, CW, 138, 6, 6, 'F');
  setFill(C.teal);
  doc.rect(ML, y, 4, 138, 'F');

  setText(C.tealLight);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CYBERPOSTURE AI', ML + 14, y + 24);

  setText(C.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('SECURITY ASSESSMENT REPORT', ML + 14, y + 54);

  doc.setFontSize(20);
  doc.text(orgName, ML + 14, y + 82);

  setText(C.gray2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Organization Type: ${orgType}`, ML + 14, y + 104);
  doc.text(`Date: ${dateStr}`, ML + 14, y + 120);
  doc.text(`Report ID: #${reportId}`, PW - MR, y + 120, { align: 'right' });

  y += 158;

  // Score summary cards (2x2 grid)
  const gapX = 12;
  const cardW = (CW - gapX) / 2;
  const cardH = 92;

  function drawCard(x, yPos, title, value, sub, tone) {
    const toneFill = tone === 'red' ? C.redLight : tone === 'amber' ? C.amberLight : tone === 'teal' ? C.tealLight : C.gray1;
    const toneText = tone === 'red' ? C.red : tone === 'amber' ? C.amber : tone === 'teal' ? C.teal : C.black;
    setFill(toneFill);
    setStroke(C.gray2);
    doc.roundedRect(x, yPos, cardW, cardH, 5, 5, 'FD');
    setText(C.gray3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(String(title).toUpperCase(), x + 12, yPos + 18);
    setText(toneText);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(34);
    doc.text(String(value), x + 12, yPos + 56);
    if (sub) {
      setText(C.gray3);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(sub, x + 12, yPos + 74);
    }
  }

  const actionRequired = rLabel === 'Critical' || rLabel === 'High'
    ? 'Start urgent fixes in Week 1'
    : 'Begin structured improvements this month';

  drawCard(ML, y, 'Overall Score', `${score}`, '/100', 'teal');
  drawCard(ML + cardW + gapX, y, 'Risk Level', rLabel, '', rLabel === 'Low' ? 'teal' : rLabel === 'Medium' ? 'amber' : 'red');
  y += cardH + 10;
  drawCard(ML, y, 'Action Required', rLabel === 'High' || rLabel === 'Critical' ? 'Urgent' : 'Planned', actionRequired, rLabel === 'High' || rLabel === 'Critical' ? 'red' : 'amber');
  drawCard(ML + cardW + gapX, y, 'Domains Assessed', `${catRows.length}`, 'Security categories reviewed', 'gray');
  y += cardH + 18;

  // Confidential notice
  setStroke(C.gray2);
  doc.setLineWidth(0.7);
  doc.line(ML, y, PW - MR, y);
  y += 14;
  setText(C.gray3);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Confidential report. Share only with authorized personnel.', ML, y);
  y += 22;

  // Executive summary
  y = drawSectionTitle(y, '1. Executive Summary');
  setText(C.black);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  y = wrap(
    `${orgName} scored ${score}/100 and is currently in the ${rLabel} risk range. ` +
      `The biggest opportunities are in ${weakest[0]?.name || 'key domains'} and ${weakest[1]?.name || 'secondary domains'}. ` +
      `Addressing these first will deliver the fastest risk reduction this month.`,
    ML,
    y,
    CW,
    14
  );
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  setText(C.navy);
  y = wrap(`Strengths: ${strongest.name} (${strongest.percent}%) is your strongest domain and a solid base to build from.`, ML, y, CW, 14);
  y = wrap(`Critical Gaps: ${weakest[0]?.name || 'N/A'} and ${weakest[1]?.name || 'N/A'} need immediate attention to reduce operational risk.`, ML, y + 2, CW, 14);
  y = wrap('Good News: Most high-impact actions are low-cost and can be started this week.', ML, y + 2, CW, 14);
  y += 8;

  if (aiSummary) {
    y = drawSectionTitle(y, 'AI Recommendation Summary');
    y = ensureSpace(y, 90);
    setText(C.black);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    y = wrap(aiSummary, ML, y, CW, 13);
    y += 8;
  }

  // Findings section with table
  y = drawSectionTitle(y, '2. Findings');
  y = ensureSpace(y, 170);
  const tX = ML;
  const tW = CW;
  const colA = Math.round(tW * 0.54);
  const colB = Math.round(tW * 0.16);
  const colC = tW - colA - colB;
  const headH = 24;
  const rowH = 24;

  setFill(C.navy);
  doc.rect(tX, y, tW, headH, 'F');
  setText(C.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Category', tX + 8, y + 16);
  doc.text('Score', tX + colA + 8, y + 16);
  doc.text('Rating', tX + colA + colB + 8, y + 16);
  y += headH;

  catRows.forEach((c, idx) => {
    const fill = idx % 2 === 0 ? C.white : C.gray1;
    setFill(fill);
    doc.rect(tX, y, tW, rowH, 'F');
    setStroke(C.gray2);
    doc.setLineWidth(0.5);
    doc.line(tX, y + rowH, tX + tW, y + rowH);
    const cColor = riskColor(c.percent);
    setText(C.black);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(c.name, tX + 8, y + 16);
    setText(cColor);
    doc.text(`${c.percent}%`, tX + colA + 8, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(riskWord(c.percent), tX + colA + colB + 8, y + 16);
    y += rowH;
  });

  y += 12;
  for (const c of catRows) {
    y = ensureSpace(y, 66);
    setText(riskColor(c.percent));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`${c.name} - ${c.percent}%`, ML, y);
    y += 14;
    setText(C.black);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    y = wrap(`What is wrong: ${c.percent < 50 ? 'Controls are incomplete or inconsistent in this domain.' : 'Performance is acceptable but still has improvement opportunities.'}`, ML, y, CW, 13);
    y = wrap(`Why it is risky: ${c.percent < 50 ? 'Weak controls here can lead to avoidable disruptions, incidents, or recovery costs.' : 'Gaps left unchecked can grow into larger risks over time.'}`, ML, y + 1, CW, 13);
    y = wrap(`What to fix: ${categoryAction(c.name).action}.`, ML, y + 1, CW, 13);
    y += 6;
  }

  // Top priorities
  y = drawSectionTitle(y, 'Top Priorities - What to Fix First');
  y = ensureSpace(y, 140);
  setText(C.black);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  y = wrap(
    `Most important this month: focus on ${weakest[0]?.name || 'the weakest domain'} and ${weakest[1]?.name || 'the second weakest domain'} first. ` +
      'These actions are high-impact, low-cost, and immediately actionable.',
    ML,
    y,
    CW,
    13
  );
  y += 8;

  y = ensureSpace(y, 120);
  const pCols = [42, 112, 172, 82, 62, CW - 470];
  const pX = ML;
  const pHeadH = 24;
  const pRowH = 34;
  const pHeaders = ['P', 'Category', 'Action', 'Owner', 'Due', 'Impact'];

  setFill(C.navy);
  doc.rect(pX, y, CW, pHeadH, 'F');
  setText(C.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  let px = pX;
  pHeaders.forEach((h, i) => {
    doc.text(h, px + 6, y + 16);
    px += pCols[i];
  });
  y += pHeadH;

  weakest.slice(0, 3).forEach((w, idx) => {
    const act = categoryAction(w.name);
    setFill(idx % 2 === 0 ? C.white : C.gray1);
    doc.rect(pX, y, CW, pRowH, 'F');
    setStroke(C.gray2);
    doc.setLineWidth(0.5);
    doc.line(pX, y + pRowH, pX + CW, y + pRowH);
    setText(C.black);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    let rx = pX;
    doc.text(String(idx + 1), rx + 6, y + 14); rx += pCols[0];
    doc.text(w.name, rx + 6, y + 14); rx += pCols[1];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    wrap(act.action, rx + 6, y + 12, pCols[2] - 10, 10); rx += pCols[2];
    doc.text(act.owner, rx + 6, y + 14); rx += pCols[3];
    doc.text(act.due, rx + 6, y + 14); rx += pCols[4];
    wrap(act.impact, rx + 6, y + 12, pCols[5] - 10, 10);
    y += pRowH;
  });

  // 30-day action plan
  y = drawSectionTitle(y + 6, '3. 30-Day Action Plan');
  y = ensureSpace(y, 130);
  const aCols = [74, 188, 122, CW - 384];
  const aHeaders = ['Week', 'Action', 'Category', 'Why It Matters'];
  const actions = [
    { week: 'Week 1', action: 'Enable two-step login for critical accounts', category: weakest[0]?.name || 'Access Control', why: 'Blocks account takeover attempts quickly.' },
    { week: 'Week 1-2', action: 'Patch critical systems and verify endpoint protection', category: weakest[1]?.name || 'Device & Network', why: 'Reduces exploit and malware risk.' },
    { week: 'Week 3', action: 'Publish incident checklist and owner contacts', category: 'Incident Response', why: 'Improves response speed and accountability.' },
    { week: 'Week 3-4', action: 'Run focused staff awareness session', category: 'Security Awareness', why: 'Reduces phishing and human-error incidents.' },
    { week: 'Week 5+', action: 'Review progress and harden remaining controls', category: 'All Domains', why: 'Sustains gains and prevents regression.' },
  ];

  setFill(C.navy);
  doc.rect(ML, y, CW, 24, 'F');
  setText(C.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  let ax = ML;
  aHeaders.forEach((h, i) => {
    doc.text(h, ax + 6, y + 16);
    ax += aCols[i];
  });
  y += 24;

  actions.forEach((a, idx) => {
    y = ensureSpace(y, 30);
    setFill(idx % 2 === 0 ? C.white : C.gray1);
    doc.rect(ML, y, CW, 30, 'F');
    setStroke(C.gray2);
    doc.setLineWidth(0.5);
    doc.line(ML, y + 30, ML + CW, y + 30);
    setText(C.black);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    let cx = ML;
    doc.text(a.week, cx + 6, y + 18); cx += aCols[0];
    doc.setFont('helvetica', 'normal');
    wrap(a.action, cx + 6, y + 14, aCols[1] - 10, 10); cx += aCols[1];
    doc.text(a.category, cx + 6, y + 18); cx += aCols[2];
    wrap(a.why, cx + 6, y + 14, aCols[3] - 10, 10);
    y += 30;
  });

  // Closing
  y = drawSectionTitle(y + 8, '4. Closing and Next Steps');
  setText(C.black);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y = wrap(
    'Assign one owner to track weekly progress, remove blockers, and report completion. ' +
      'Reassess in 60-90 days to confirm score improvement and set the next priority cycle.',
    ML,
    y,
    CW,
    14
  );
  y += 12;
  setText(C.gray3);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.text('- End of Report -', PW / 2, y, { align: 'center' });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let pNum = 1; pNum <= totalPages; pNum += 1) {
    doc.setPage(pNum);
    setStroke(C.gray2);
    doc.setLineWidth(0.6);
    doc.line(ML, PH - 32, PW - MR, PH - 32);
    setText(C.gray3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Confidential - CyberPosture AI', ML, PH - 18);
    doc.text(dateStr, PW / 2, PH - 18, { align: 'center' });
    doc.text(`Page ${pNum} of ${totalPages}`, PW - MR, PH - 18, { align: 'right' });
  }

  const safeOrg = sanitizeFileSegment(orgName);
  const fileName = `cyberposture-report-${safeOrg}-${new Date().toISOString().slice(0, 10)}.pdf`;
  const dataUri = doc.output('datauristring');
  const pdfBase64 = dataUri.split(',')[1] || '';

  if (latestReportData.mode === 'tracked' && latestReportData.recordId) {
    saveReportPdfToDatabase(latestReportData.recordId, fileName, pdfBase64).catch((error) => {
      console.error('PDF save failed:', error);
      alert(error.message || 'Could not save PDF to your account.');
    });
  }

  doc.save(fileName);
}


function streamReport(raw) {
  const el = document.getElementById('reportBody');
  el.innerHTML = '<span class="cursor"></span>';

  const textNode = document.createElement('span');
  el.insertBefore(textNode, el.querySelector('.cursor'));

  let i = 0;
  function tick() {
    if (i < raw.length) {
      textNode.textContent += raw[i++];
      setTimeout(tick, i % 6 === 0 ? 0 : 5);
    } else {
      el.querySelector('.cursor')?.remove();
      // Render constrained markdown from escaped text to prevent script injection.
      el.innerHTML = markdownToSafeHtml(raw);
    }
  }
  tick();
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markdownToSafeHtml(raw) {
  const escaped = escapeHtml(raw).replace(/\r/g, '');
  const lines = escaped.split('\n');
  const html = [];
  let inUl = false;
  let inOl = false;

  const inline = (text) => text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const closeLists = () => {
    if (inUl) {
      html.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      html.push('</ol>');
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeLists();
      html.push('');
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      closeLists();
      html.push(`<h2>${inline(h2[1])}</h2>`);
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      closeLists();
      html.push(`<h3>${inline(h3[1])}</h3>`);
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      if (inUl) {
        html.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        html.push('<ol>');
        inOl = true;
      }
      html.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    const ul = line.match(/^-\s+(.+)$/);
    if (ul) {
      if (inOl) {
        html.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        html.push('<ul>');
        inUl = true;
      }
      html.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p>${inline(line)}</p>`);
  }

  closeLists();
  return html.join('\n').replace(/\n{3,}/g, '\n\n');
}

// ─── RESET ───────────────────────────────────────────────────────
function resetAll() {
  if (isSubmitting) return;
  answers = {};
  currentQ = 0;
  orgName = '';
  latestReportData = null;
  togglePdfButton('one-time');
  orgType = document.getElementById('orgType').value;
  // Clear all selected states
  document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.btn-next').forEach(b => b.disabled = true);
  clearProgress();
  document.getElementById('orgName').value = '';
  showScreen('setup');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function persistProgress() {
  const selectedMode = document.querySelector('input[name="assessmentMode"]:checked')?.value || assessmentMode;
  const payload = {
    answers,
    orgName: document.getElementById('orgName').value.trim(),
    orgType: document.getElementById('orgType').value,
    assessmentMode: selectedMode,
    currentQ
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
}

function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}

function hydrateProgress() {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);
    answers = saved.answers || {};
    orgName = saved.orgName || '';
    orgType = saved.orgType || document.getElementById('orgType').value;
    assessmentMode = saved.assessmentMode || assessmentMode;
    currentQ = typeof saved.currentQ === 'number' ? saved.currentQ : 0;

    document.getElementById('orgName').value = orgName;
    document.getElementById('orgType').value = orgType;
    const modeInput = document.querySelector(`input[name="assessmentMode"][value="${assessmentMode}"]`);
    if (modeInput) modeInput.checked = true;

    QUESTIONS.forEach((q, qIdx) => {
      const pts = answers[q.id];
      if (pts === undefined) return;
      const selectedIndex = q.options.findIndex(o => o.pts === pts);
      if (selectedIndex === -1) return;

      q.options.forEach((_, optIdx) => {
        document.getElementById('opt-' + qIdx + '-' + optIdx)
          .classList.toggle('selected', optIdx === selectedIndex);
      });
      document.getElementById('next-' + qIdx).disabled = false;
    });

    if (Object.keys(answers).length > 0 && currentQ < QUESTIONS.length) {
      showScreen('q', Math.max(0, currentQ));
    }
  } catch {
    clearProgress();
  }
}

async function fetchCurrentUserProfile() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function bootstrap() {
  buildScreens();

  const isNewAssessment = APP_PARAMS.get('new') === '1';
  const startMode = APP_PARAMS.get('start');

  if (!isNewAssessment) {
    hydrateProgress();
  } else {
    clearProgress();
    answers = {};
    currentQ = 0;
  }

  if (startMode === 'questions') {
    const profile = await fetchCurrentUserProfile();

    if (profile?.org_name) {
      document.getElementById('orgName').value = profile.org_name;
    }

    if (profile?.org_type) {
      document.getElementById('orgType').value = profile.org_type;
    }

    // Logged-in users coming from the dashboard automatically use tracked mode.
    if (localStorage.getItem(AUTH_TOKEN_KEY)) {
      const trackedRadio = document.querySelector('input[name="assessmentMode"][value="tracked"]');
      if (trackedRadio) trackedRadio.checked = true;
    }

    if (document.getElementById('orgName').value.trim()) {
      const started = await startAssessment();
      if (started) {
        return;
      }
    }
  }

  showScreen('setup');
}

// ─── INIT ─────────────────────────────────────────────────────────
bootstrap();

window.downloadCurrentReportPdf = downloadCurrentReportPdf;
