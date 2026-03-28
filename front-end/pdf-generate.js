// ── PDF Report Generator ─────────────────────────────────────────
// Depends on jsPDF (loaded via CDN in index.html)

function downloadCurrentReportPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });

  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 48, MR = 48, TW = PW - ML - MR;

  // ── Colours ──────────────────────────────────────────────────────
  const NAVY   = [27,  42,  74];
  const TEAL   = [0,   165, 114];
  const RED    = [185, 28,  28];
  const ORANGE = [217, 119, 6];
  const GREEN  = [21,  128, 61];
  const GRAY1  = [248, 249, 250];
  const GRAY2  = [200, 205, 215];
  const GRAY3  = [108, 117, 125];
  const WHITE  = [255, 255, 255];
  const BLACK  = [17,  22,  40];

  // ── Read DOM ─────────────────────────────────────────────────────
  const orgName  = document.getElementById('orgName')?.value  || 'Your Organization';
  const orgType  = document.getElementById('orgType')?.value  || '';
  const score    = document.getElementById('bigScore')?.textContent || '--';
  const riskText = document.getElementById('riskBadge')?.textContent || '--';
  const dbNote   = document.getElementById('dbNote')?.textContent   || '';
  const reportMd = document.getElementById('reportBody')?.innerText || '';

  const catNames = ['Access Control','Data Protection','Device & Network','Incident Response','Security Awareness'];
  const catPcts  = [1,2,3,4,5].map(i => {
    const t = document.getElementById('cp'+i)?.textContent || '0%';
    return parseInt(t) || 0;
  });

  function riskColor(pct) {
    if (pct >= 75) return GREEN;
    if (pct >= 60) return TEAL;
    if (pct >= 40) return ORANGE;
    return RED;
  }

  function scoreColor(s) {
    const n = parseInt(s);
    if (n >= 75) return GREEN;
    if (n >= 60) return TEAL;
    if (n >= 40) return ORANGE;
    return RED;
  }

  let y = 0;

  function checkPage(needed = 40) {
    if (y + needed > PH - 48) {
      doc.addPage();
      y = 48;
      drawPageHeader();
    }
  }

  function drawPageHeader() {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, PW, 28, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY2);
    doc.text('CyberPosture AI  ·  Security Assessment Report', ML, 18);
    doc.text(orgName, PW - MR, 18, { align: 'right' });
    y = 44;
  }

  // ── COVER PAGE ───────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PW, 160, 'F');

  doc.setFontSize(11);
  doc.setTextColor(...TEAL);
  doc.text('CYBERPOSTURE AI', ML, 52);

  doc.setFontSize(9);
  doc.setTextColor(...GRAY2);
  doc.text('Cyber Risk Intelligence Platform', ML, 68);

  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text('SECURITY ASSESSMENT REPORT', ML, 90);

  y = 180;

  doc.setFontSize(24);
  doc.setTextColor(...NAVY);
  doc.text(orgName, ML, y);
  y += 22;

  doc.setFontSize(11);
  doc.setTextColor(...GRAY3);
  doc.text(orgType || '', ML, y);
  y += 16;

  doc.setFontSize(9);
  doc.text(dbNote, ML, y);
  y += 32;

  // Divider
  doc.setDrawColor(...GRAY2);
  doc.setLineWidth(0.5);
  doc.line(ML, y, PW - MR, y);
  y += 28;

  // Metric boxes
  const boxW = (TW - 16) / 3;
  const metrics = [
    { label: 'Overall Score', value: score, sub: 'out of 100', color: scoreColor(score) },
    { label: 'Risk Level', value: riskText.replace(' Risk', ''), sub: 'Risk', color: riskText.includes('Critical') ? RED : riskText.includes('High') ? ORANGE : riskText.includes('Medium') ? [180,140,0] : GREEN },
    { label: 'Categories', value: '5', sub: 'assessed', color: NAVY },
  ];

  metrics.forEach((m, i) => {
    const bx = ML + i * (boxW + 8);
    doc.setFillColor(...GRAY1);
    doc.roundedRect(bx, y, boxW, 72, 4, 4, 'F');

    doc.setFontSize(8);
    doc.setTextColor(...GRAY3);
    doc.text(m.label, bx + boxW / 2, y + 16, { align: 'center' });

    doc.setFontSize(26);
    doc.setTextColor(...m.color);
    doc.text(String(m.value), bx + boxW / 2, y + 46, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(...GRAY3);
    doc.text(m.sub, bx + boxW / 2, y + 62, { align: 'center' });
  });
  y += 90;

  doc.setFontSize(8);
  doc.setTextColor(...GRAY3);
  doc.text('This report is confidential and intended solely for the use of ' + orgName + '.', ML, y);

  // ── PAGE 2+ ──────────────────────────────────────────────────────
  doc.addPage();
  drawPageHeader();

  function sectionHeading(title) {
    checkPage(48);
    doc.setFillColor(...NAVY);
    doc.rect(ML, y, TW, 1.5, 'F');
    y += 20;
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    doc.text(title, ML, y);
    y += 18;
  }

  function subHeading(title, color = NAVY) {
    checkPage(32);
    doc.setFontSize(10);
    doc.setTextColor(...color);
    doc.text(title, ML, y);
    y += 16;
  }

  function bodyText(text, indent = 0) {
    const lines = doc.splitTextToSize(text, TW - indent);
    lines.forEach(line => {
      checkPage(14);
      doc.setFontSize(9);
      doc.setTextColor(...BLACK);
      doc.text(line, ML + indent, y);
      y += 13;
    });
    y += 3;
  }

  function bulletPoint(text) {
    checkPage(14);
    doc.setFontSize(9);
    doc.setTextColor(...TEAL);
    doc.text('•', ML + 4, y);
    doc.setTextColor(...BLACK);
    const lines = doc.splitTextToSize(text, TW - 18);
    lines.forEach(line => {
      checkPage(14);
      doc.text(line, ML + 16, y);
      y += 13;
    });
    y += 2;
  }

  // Section 1 — Category Breakdown
  sectionHeading('1. Category Breakdown');

  catNames.forEach((name, i) => {
    checkPage(26);
    const pct    = catPcts[i];
    const color  = riskColor(pct);
    const barW   = TW - 120;
    const filled = Math.round((pct / 100) * barW);

    doc.setFontSize(9);
    doc.setTextColor(...BLACK);
    doc.text(name, ML, y);

    doc.setFillColor(...GRAY2);
    doc.roundedRect(ML + 120, y - 8, barW, 10, 2, 2, 'F');

    if (filled > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(ML + 120, y - 8, filled, 10, 2, 2, 'F');
    }

    doc.setFontSize(9);
    doc.setTextColor(...color);
    doc.text(pct + '%', PW - MR, y, { align: 'right' });

    y += 22;
  });

  y += 8;

  // Section 2 — AI Report
  sectionHeading('2. AI-Generated Security Report');

  reportMd.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) { y += 5; return; }

    if (trimmed.startsWith('## ')) {
      subHeading(trimmed.replace('## ', ''));
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      bulletPoint(trimmed.replace(/^[-•]\s/, ''));
    } else {
      bodyText(trimmed);
    }
  });

  y += 10;

  // Section 3 — Next Steps
  sectionHeading('3. Next Steps');
  [
    'Share this report with leadership and assign action owners.',
    'Kick off Priority 1 items this week with your IT support.',
    'Re-assess in 60–90 days to measure improvement.',
  ].forEach((s, i) => {
    checkPage(20);
    doc.setFontSize(9);
    doc.setTextColor(...TEAL);
    doc.text(String(i + 1) + '.', ML + 4, y);
    doc.setTextColor(...BLACK);
    doc.splitTextToSize(s, TW - 18).forEach(l => { doc.text(l, ML + 18, y); y += 13; });
    y += 4;
  });

  // ── Footer on every page ──────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(...GRAY2);
    doc.setLineWidth(0.5);
    doc.line(ML, PH - 30, PW - MR, PH - 30);
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY3);
    doc.text(`Confidential  ·  ${new Date().toLocaleDateString()}`, ML, PH - 18);
    doc.text(`Page ${p} of ${pageCount}`, PW - MR, PH - 18, { align: 'right' });
  }

  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}
