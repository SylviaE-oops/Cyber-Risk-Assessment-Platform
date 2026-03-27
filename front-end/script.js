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

// State
let currentQ = 0; // 0 = setup, 1-25 = questions
let answers = {}; // { questionId: pts }
let orgName = '';
let orgType = '';

// ─── BUILD QUESTION SCREENS ───────────────────────────────────────
function buildScreens() {
  const container = document.getElementById('questionScreens');
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
}

function startAssessment() {
  orgName = document.getElementById('orgName').value.trim() || 'your organization';
  orgType = document.getElementById('orgType').value;
  showScreen('q', 0);
}

function goNext(qIdx) {
  if (qIdx < QUESTIONS.length-1) {
    showScreen('q', qIdx+1);
  } else {
    submitAssessment();
  }
}

function goBack(qIdx) {
  if (qIdx === 0) showScreen('setup');
  else showScreen('q', qIdx-1);
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

// ─── MOCK DB ──────────────────────────────────────────────────────
// In production this would be a real POST to your backend API.
// Here we simulate a DB save using localStorage as the storage layer.
async function saveToDatabase(record) {
  return new Promise(resolve => {
    setTimeout(() => {
      const id = 'ASMT-' + Date.now().toString(36).toUpperCase();
      const stored = JSON.parse(localStorage.getItem('cyberposture_db') || '[]');
      stored.push({ id, ...record, savedAt: new Date().toISOString() });
      localStorage.setItem('cyberposture_db', JSON.stringify(stored));
      resolve(id);
    }, 900);
  });
}

// ─── AI AGENT ────────────────────────────────────────────────────
async function runAIAgent(scores, tier, orgName, orgType) {
  const { cats, pct } = scores;
  const catData = CAT_NAMES.map((name, i) => ({
    name,
    score: cats[i],
    max: CAT_MAX[i],
    pct: Math.round((cats[i]/CAT_MAX[i])*100)
  }));
  const weakest = [...catData].sort((a,b)=>a.pct-b.pct).slice(0,3);

  const prompt = `You are a cybersecurity advisor helping ${orgName}, a ${orgType}, understand their security assessment results in plain, non-technical language.

Assessment Results:
- Overall Cyber Risk Score: ${pct}/100 — ${tier.label} Risk
${catData.map(c => `- ${c.name}: ${c.score}/${c.max} pts (${c.pct}%)`).join('\n')}

Weakest areas: ${weakest.map(w => `${w.name} (${w.pct}%)`).join(', ')}

Write a security report with these four sections using ## headings:

## What this score means
2–3 sentences explaining what this risk level means day-to-day for a non-technical audience.

## Your biggest risks right now
For the 2–3 weakest categories: explain what could go wrong in plain language with a concrete real-world scenario. No jargon.

## Top 3 things to fix first
Three specific, actionable steps prioritized by impact. For each: a short name, one sentence on why it matters, and a concrete first step to take this week.

## What you're doing well
1–2 categories where the organization scored well. Brief and encouraging.

Tone: direct, clear, human — like a knowledgeable friend explaining over coffee. Never use: "threat vector", "attack surface", "remediate", "mitigate", "leverage", or "stakeholders".`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'API error');
  return data.content?.[0]?.text || '';
}

// ─── SUBMIT FLOW ─────────────────────────────────────────────────
async function submitAssessment() {
  showScreen('saving');

  const scores = calcScores();
  const tier = getRiskTier(scores.pct);

  // Step 1: Score
  setStep(1, 'active');
  await delay(600);
  setStep(1, 'done');

  // Step 2: Save to DB
  setStep(2, 'active');
  const record = {
    orgName, orgType,
    scores: scores.cats,
    total: scores.total,
    pct: scores.pct,
    tier: tier.label,
    answers
  };
  const recordId = await saveToDatabase(record);
  setStep(2, 'done');

  // Step 3: AI Agent
  setStep(3, 'active');
  let aiReport = '';
  try {
    aiReport = await runAIAgent(scores, tier, orgName, orgType);
  } catch(e) {
    aiReport = generateFallbackReport(scores, tier, orgName);
  }
  setStep(3, 'done');

  // Step 4: Build report
  setStep(4, 'active');
  await delay(400);
  setStep(4, 'done');

  await delay(300);
  showResults(scores, tier, aiReport, recordId);
}

function setStep(n, state) {
  const el = document.getElementById('step'+n);
  el.className = 'step-row ' + state;
  if (state === 'done') el.querySelector('.step-icon').textContent = '✓';
  if (state === 'active') el.querySelector('.step-icon').textContent = '◌';
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── SHOW RESULTS ─────────────────────────────────────────────────
function showResults(scores, tier, aiReport, recordId) {
  showScreen('results');

  // DB note
  document.getElementById('dbNote').textContent =
    `Saved to database — Record ID: ${recordId} · ${new Date().toLocaleString()}`;

  // Score hero
  document.getElementById('bigScore').textContent = scores.pct;
  document.getElementById('bigScore').style.color = tier.color;
  document.getElementById('riskBadge').textContent = tier.label + ' Risk';
  document.getElementById('riskBadge').className = 'risk-badge ' + tier.cls;
  document.getElementById('scoreDesc').textContent = tier.desc;

  // Category bars
  scores.cats.forEach((val, i) => {
    const pct = Math.round((val/CAT_MAX[i])*100);
    setTimeout(() => {
      document.getElementById('cf'+(i+1)).style.width = pct+'%';
      document.getElementById('cf'+(i+1)).style.background = getBarColor(pct);
      document.getElementById('cp'+(i+1)).textContent = pct+'%';
    }, 300 + i*120);
  });

  // Stream AI report
  streamReport(aiReport);
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
      // Render markdown
      el.innerHTML = raw
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>[^<]*<\/li>\n?)+/g, m => '<ul>'+m+'</ul>')
        .split('\n\n')
        .map(p => p.startsWith('<') ? p : `<p>${p}</p>`)
        .join('');
    }
  }
  tick();
}

// ─── FALLBACK REPORT (if API unavailable) ────────────────────────
function generateFallbackReport(scores, tier, orgName) {
  const cats = CAT_NAMES.map((name,i) => ({ name, pct: Math.round((scores.cats[i]/CAT_MAX[i])*100) }));
  const weakest = [...cats].sort((a,b)=>a.pct-b.pct).slice(0,2);
  const strongest = [...cats].sort((a,b)=>b.pct-a.pct)[0];

  return `## What this score means

${orgName} scored ${scores.pct}/100, placing you in the **${tier.label} Risk** category. ${tier.desc} This means there are concrete steps you can take right now to reduce the chance of a security incident.

## Your biggest risks right now

**${weakest[0].name} (${weakest[0].pct}%)** — This is your most significant gap. For example, if employees reuse passwords or don't use two-step login, a single stolen password could give an attacker access to everything. It's one of the most common ways small organizations get compromised.

**${weakest[1].name} (${weakest[1].pct}%)** — Without a clear plan here, your team won't know what to do when something goes wrong — and that turns a small incident into a big one.

## Top 3 things to fix first

**1. Enable two-step login** — Even if one password gets stolen, attackers can't get in without the second factor. This week: turn on MFA for email accounts first — it's usually free and takes under an hour.

**2. Run a security awareness session** — Most breaches start with a phishing email. This week: schedule a 30-minute team meeting to walk through what a suspicious email looks like.

**3. Create an incident response contact list** — If something goes wrong, you need to know who to call. This week: write down your IT contact, internet provider number, and cyber insurance info in one place.

## What you're doing well

**${strongest.name} (${strongest.pct}%)** — This is your strongest area. Keep maintaining these practices as a foundation to build on.`;
}

// ─── RESET ───────────────────────────────────────────────────────
function resetAll() {
  answers = {};
  currentQ = 0;
  // Clear all selected states
  document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.btn-next').forEach(b => b.disabled = true);
  showScreen('setup');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── INIT ─────────────────────────────────────────────────────────
buildScreens();
