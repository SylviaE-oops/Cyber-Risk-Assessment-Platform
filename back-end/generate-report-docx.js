const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
  SimpleField,
  LevelFormat,
  PageBreak,
  Header,
  Footer,
} = require('docx');
const fs = require('fs');
const path = require('path');

// -- Brand colours ---------------------------------------------------
const NAVY = '1B2A4A';
const TEAL = '0A7E6A';
const TEAL_L = 'E6F4F1';
const AMBER = 'D97706';
const AMBER_L = 'FEF3C7';
const RED = 'B91C1C';
const RED_L = 'FEE2E2';
const GREEN = '15803D';
const GREEN_L = 'DCFCE7';
const GRAY1 = 'F8F9FA';
const GRAY2 = 'E9ECEF';
const GRAY3 = '6C757D';
const WHITE = 'FFFFFF';
const BLACK = '111827';

// -- Report data -----------------------------------------------------
const DATA = {
  org: 'JST Organization',
  type: 'Small Business',
  date: 'March 28, 2026',
  reportId: '7',
  score: 50,
  risk: 'High',
  categories: [
    { name: 'Access Control', pct: 78, risk: 'Low' },
    { name: 'Data Protection', pct: 41, risk: 'High' },
    { name: 'Device & Network', pct: 40, risk: 'High' },
    { name: 'Incident Response', pct: 44, risk: 'High' },
    { name: 'Security Awareness', pct: 43, risk: 'High' },
  ],
};

// -- Helpers ---------------------------------------------------------
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' };

function txt(text, opts = {}) {
  return new TextRun({
    text,
    font: 'Arial',
    size: opts.size || 22,
    bold: opts.bold || false,
    color: opts.color || BLACK,
    italics: opts.italic || false,
    ...opts,
  });
}

function para(children, opts = {}) {
  if (typeof children === 'string') children = [txt(children, opts.run || {})];
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before || 0, after: opts.after || 120 },
    indent: opts.indent ? { left: opts.indent } : undefined,
    border: opts.border || undefined,
    children,
  });
}

function heading1(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 360, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 6 } },
    children: [new TextRun({ text, font: 'Arial', size: 32, bold: true, color: NAVY })],
  });
}

function heading2(text, color = NAVY) {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, font: 'Arial', size: 24, bold: true, color })],
  });
}

function bullet(text, boldPart = '') {
  const children = [];
  if (boldPart) {
    children.push(new TextRun({ text: `${boldPart} `, font: 'Arial', size: 22, bold: true, color: BLACK }));
    children.push(new TextRun({ text, font: 'Arial', size: 22, color: BLACK }));
  } else {
    children.push(new TextRun({ text, font: 'Arial', size: 22, color: BLACK }));
  }
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { before: 40, after: 60 },
    children,
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY2, space: 1 } },
    children: [],
  });
}

function infoBox(label, bodyLines, bgColor = TEAL_L, accentColor = TEAL) {
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: accentColor, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          borders: noBorders,
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0 },
              children: [new TextRun({ text: label, font: 'Arial', size: 20, bold: true, color: WHITE })],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: bgColor, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          borders: noBorders,
          children: bodyLines.map(
            (l) =>
              new Paragraph({
                spacing: { before: 20, after: 60 },
                children: [new TextRun({ text: l, font: 'Arial', size: 22, color: BLACK })],
              })
          ),
        }),
      ],
    }),
  ];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    borders: noBorders,
    rows,
  });
}

function metricRow(items) {
  const colW = Math.floor(9360 / items.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: items.map(() => colW),
    borders: noBorders,
    rows: [
      new TableRow({
        children: items.map((item, i) =>
          new TableCell({
            width: { size: colW, type: WidthType.DXA },
            shading: { fill: i % 2 === 0 ? GRAY1 : WHITE, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            borders: { ...noBorders, right: i < items.length - 1 ? thinBorder : noBorder },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 40 },
                children: [new TextRun({ text: item.label, font: 'Arial', size: 18, color: GRAY3 })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 40 },
                children: [new TextRun({ text: item.value, font: 'Arial', size: 52, bold: true, color: item.valueColor || NAVY })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: item.sub || '', font: 'Arial', size: 19, color: GRAY3 })],
              }),
            ],
          })
        ),
      }),
    ],
  });
}

function barChart(categories) {
  const BAR_TOTAL = 6240;
  const LABEL_W = 2000;
  const PCT_W = 700;
  const BAR_W = BAR_TOTAL;
  const TOTAL_W = LABEL_W + BAR_W + PCT_W;

  function riskFill(pct) {
    if (pct >= 75) return GREEN;
    if (pct >= 60) return TEAL;
    if (pct >= 40) return AMBER;
    return RED;
  }
  function riskLabel(pct) {
    if (pct >= 75) return 'Strong';
    if (pct >= 60) return 'Moderate';
    if (pct >= 40) return 'Weak';
    return 'Critical';
  }

  const headerRow = new TableRow({
    children: [
      new TableCell({
        width: { size: LABEL_W, type: WidthType.DXA },
        borders: noBorders,
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [para([new TextRun({ text: 'Category', font: 'Arial', size: 18, bold: true, color: GRAY3 })], { after: 0 })],
      }),
      new TableCell({
        width: { size: BAR_W, type: WidthType.DXA },
        borders: noBorders,
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [para([new TextRun({ text: 'Performance', font: 'Arial', size: 18, bold: true, color: GRAY3 })], { after: 0 })],
      }),
      new TableCell({
        width: { size: PCT_W, type: WidthType.DXA },
        borders: noBorders,
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text: 'Score', font: 'Arial', size: 18, bold: true, color: GRAY3 })],
          }),
        ],
      }),
    ],
  });

  const dataRows = categories.map((cat) => {
    const filled = Math.round((cat.pct / 100) * BAR_W);
    const empty = BAR_W - filled;
    const fill = riskFill(cat.pct);
    const rlabel = riskLabel(cat.pct);

    const barInner = new Table({
      width: { size: BAR_W, type: WidthType.DXA },
      columnWidths: filled > 0 ? (empty > 0 ? [filled, empty] : [BAR_W]) : [BAR_W],
      borders: noBorders,
      rows: [
        new TableRow({
          children: [
            ...(filled > 0
              ? [
                  new TableCell({
                    width: { size: filled, type: WidthType.DXA },
                    shading: { fill, type: ShadingType.CLEAR },
                    borders: noBorders,
                    margins: { top: 100, bottom: 100, left: 0, right: 0 },
                    children: [para(' ', { after: 0 })],
                  }),
                ]
              : []),
            ...(empty > 0
              ? [
                  new TableCell({
                    width: { size: empty, type: WidthType.DXA },
                    shading: { fill: GRAY2, type: ShadingType.CLEAR },
                    borders: noBorders,
                    margins: { top: 100, bottom: 100, left: 0, right: 0 },
                    children: [para(' ', { after: 0 })],
                  }),
                ]
              : []),
          ],
        }),
      ],
    });

    return new TableRow({
      children: [
        new TableCell({
          width: { size: LABEL_W, type: WidthType.DXA },
          borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 2, color: GRAY2 } },
          margins: { top: 120, bottom: 120, left: 80, right: 80 },
          children: [para([new TextRun({ text: cat.name, font: 'Arial', size: 21, bold: true, color: BLACK })], { after: 0 })],
        }),
        new TableCell({
          width: { size: BAR_W, type: WidthType.DXA },
          borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 2, color: GRAY2 } },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 100, bottom: 100, left: 80, right: 80 },
          children: [barInner],
        }),
        new TableCell({
          width: { size: PCT_W, type: WidthType.DXA },
          borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 2, color: GRAY2 } },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 20 },
              children: [new TextRun({ text: `${cat.pct}%`, font: 'Arial', size: 26, bold: true, color: fill })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
              children: [new TextRun({ text: rlabel, font: 'Arial', size: 16, color: fill })],
            }),
          ],
        }),
      ],
    });
  });

  return new Table({
    width: { size: TOTAL_W, type: WidthType.DXA },
    columnWidths: [LABEL_W, BAR_W, PCT_W],
    borders: noBorders,
    rows: [headerRow, ...dataRows],
  });
}

function actionTable(rows) {
  const COL = [600, 2100, 2100, 3560, 1000];
  const TOTAL = COL.reduce((a, b) => a + b, 0);

  function priColor(p) {
    if (p === '1') return [RED, RED_L];
    if (p === '2') return [AMBER, AMBER_L];
    return [GREEN, GREEN_L];
  }

  const hdr = new TableRow({
    tableHeader: true,
    children: ['#', 'Action', 'Category', 'Description', 'Week'].map((h, i) =>
      new TableCell({
        width: { size: COL[i], type: WidthType.DXA },
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        borders: noBorders,
        children: [
          new Paragraph({
            alignment: i > 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text: h, font: 'Arial', size: 19, bold: true, color: WHITE })],
          }),
        ],
      })
    ),
  });

  const dataRows = rows.map((r) => {
    const [c, bg] = priColor(r.priority);
    return new TableRow({
      children: [
        new TableCell({
          width: { size: COL[0], type: WidthType.DXA },
          shading: { fill: bg, type: ShadingType.CLEAR },
          borders: noBorders,
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: r.priority, font: 'Arial', size: 26, bold: true, color: c })] })],
        }),
        new TableCell({
          width: { size: COL[1], type: WidthType.DXA },
          shading: { fill: WHITE, type: ShadingType.CLEAR },
          borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 2, color: GRAY2 } },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          verticalAlign: VerticalAlign.CENTER,
          children: [para([new TextRun({ text: r.label, font: 'Arial', size: 21, bold: true, color: BLACK })], { after: 0 })],
        }),
        new TableCell({
          width: { size: COL[2], type: WidthType.DXA },
          shading: { fill: WHITE, type: ShadingType.CLEAR },
          borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 2, color: GRAY2 } },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          verticalAlign: VerticalAlign.CENTER,
          children: [para([new TextRun({ text: r.category, font: 'Arial', size: 20, color: GRAY3 })], { after: 0 })],
        }),
        new TableCell({
          width: { size: COL[3], type: WidthType.DXA },
          shading: { fill: WHITE, type: ShadingType.CLEAR },
          borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 2, color: GRAY2 } },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          verticalAlign: VerticalAlign.CENTER,
          children: [para([new TextRun({ text: r.desc, font: 'Arial', size: 20, color: BLACK })], { after: 0 })],
        }),
        new TableCell({
          width: { size: COL[4], type: WidthType.DXA },
          shading: { fill: bg, type: ShadingType.CLEAR },
          borders: { ...noBorders, bottom: { style: BorderStyle.SINGLE, size: 2, color: GRAY2 } },
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: r.week, font: 'Arial', size: 20, bold: true, color: c })] })],
        }),
      ],
    });
  });

  return new Table({ width: { size: TOTAL, type: WidthType.DXA }, columnWidths: COL, borders: noBorders, rows: [hdr, ...dataRows] });
}

function coverPageChildren() {
  return [
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [9360],
      borders: noBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 9360, type: WidthType.DXA },
              shading: { fill: NAVY, type: ShadingType.CLEAR },
              borders: noBorders,
              margins: { top: 400, bottom: 400, left: 400, right: 400 },
              children: [
                para([new TextRun({ text: 'CYBERPOSTURE AI', font: 'Arial', size: 28, bold: true, color: WHITE })], { after: 80 }),
                para([new TextRun({ text: 'Cyber Risk Intelligence Platform', font: 'Arial', size: 20, color: 'A0AEC0' })], { after: 200 }),
                para([new TextRun({ text: 'SECURITY ASSESSMENT REPORT', font: 'Arial', size: 22, bold: true, color: '4FD1B0' })], { before: 80, after: 0 }),
              ],
            }),
          ],
        }),
      ],
    }),
    para('', { after: 280 }),
    para([new TextRun({ text: DATA.org, font: 'Arial', size: 52, bold: true, color: NAVY })], { after: 60 }),
    para([new TextRun({ text: DATA.type, font: 'Arial', size: 24, color: GRAY3 })], { after: 40 }),
    para([new TextRun({ text: `Prepared: ${DATA.date}  ·  Report ID: #${DATA.reportId}`, font: 'Arial', size: 20, color: GRAY3 })], { after: 400 }),
    divider(),
    para('', { after: 160 }),
    metricRow([
      { label: 'Overall Score', value: String(DATA.score), valueColor: AMBER, sub: 'out of 100' },
      { label: 'Risk Level', value: DATA.risk, valueColor: RED, sub: 'Immediate action required' },
      { label: 'Categories', value: String(DATA.categories.length), valueColor: NAVY, sub: 'assessed' },
    ]),
    para('', { after: 240 }),
    divider(),
    para('', { after: 120 }),
    para([
      txt('This report is confidential and intended solely for the use of ', { size: 19, color: GRAY3 }),
      txt(DATA.org, { size: 19, bold: true, color: GRAY3 }),
      txt('. It contains sensitive security information.', { size: 19, color: GRAY3 }),
    ], { after: 60 }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 480, hanging: 280 }, spacing: { before: 40, after: 60 } } },
          },
        ],
      },
      {
        reference: 'numbers',
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 480, hanging: 280 }, spacing: { before: 40, after: 60 } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 22, color: BLACK } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: NAVY },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: NAVY },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 },
      },
    ],
  },
  sections: [
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 } } },
      children: coverPageChildren(),
    },
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 } } },
      headers: {
        default: new Header({
          children: [
            new Table({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: [7000, 2360],
              borders: noBorders,
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 7000, type: WidthType.DXA },
                      borders: noBorders,
                      margins: { top: 60, bottom: 60, left: 0, right: 0 },
                      children: [para([new TextRun({ text: 'CyberPosture AI  ·  Security Assessment Report', font: 'Arial', size: 17, color: GRAY3 })], { after: 0 })],
                    }),
                    new TableCell({
                      width: { size: 2360, type: WidthType.DXA },
                      borders: noBorders,
                      margins: { top: 60, bottom: 60, left: 0, right: 0 },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          spacing: { before: 0, after: 0 },
                          children: [new TextRun({ text: DATA.org, font: 'Arial', size: 17, color: GRAY3, bold: true })],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: NAVY, space: 4 } }, spacing: { before: 0, after: 0 }, children: [] }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: GRAY2, space: 4 } },
              spacing: { before: 80, after: 0 },
              tabStops: [{ type: 'right', position: 9360 }],
              children: [
                new TextRun({ text: `Confidential  ·  ${DATA.date}`, font: 'Arial', size: 16, color: GRAY3 }),
                new TextRun({ text: '\t', font: 'Arial', size: 16 }),
                new TextRun({ text: 'Page ', font: 'Arial', size: 16, color: GRAY3 }),
                new SimpleField('PAGE'),
              ],
            }),
          ],
        }),
      },
      children: [
        heading1('1. Executive Summary'),
        para([
          txt('JST Organization ', { bold: true }),
          txt('completed a comprehensive cybersecurity risk assessment on '),
          txt('March 28, 2026', { bold: true }),
          txt('. This report presents findings across five security domains, identifies critical vulnerabilities, and provides a prioritized action plan to improve the organization\'s security posture.'),
        ], { after: 160 }),
        infoBox(
          'Assessment Verdict',
          [
            'Overall Score: 50/100 — High Risk',
            'JST Organization demonstrates strong Access Control practices, but faces significant vulnerabilities across Data Protection, Device & Network Security, Incident Response, and Security Awareness.',
            'Without intervention, these weaknesses expose the organization to data breaches, ransomware, and operational disruption.',
          ],
          AMBER_L,
          AMBER
        ),
        para('', { after: 160 }),
        new Paragraph({ spacing: { before: 0, after: 100 }, children: [new TextRun({ text: 'Key Takeaways', font: 'Arial', size: 22, bold: true, color: NAVY })] }),
        bullet('Four of five security categories scored below 50%, indicating systemic risk across the organization.'),
        bullet('Access Control (78%) is the primary strength and should serve as a model for improving other areas.'),
        bullet('Immediate action on Device & Network Security and Data Protection will yield the highest risk reduction.'),
        bullet('A structured 30-day improvement plan is outlined in Section 5 of this report.'),
        divider(),

        heading1('2. Key Findings'),
        heading2('2.1  Overall Risk Score'),
        para([
          txt('JST Organization received an overall security score of '),
          txt('50 out of 100', { bold: true, color: RED }),
          txt(', placing the organization in the '),
          txt('High Risk', { bold: true, color: RED }),
          txt(' tier. This score reflects average performance across all five assessed categories.'),
        ], { after: 200 }),
        para('', { after: 80 }),
        metricRow([
          { label: 'Access Control', value: '78%', valueColor: GREEN, sub: 'Strongest category' },
          { label: 'Incident Response', value: '44%', valueColor: AMBER, sub: 'High Risk' },
          { label: 'Security Awareness', value: '43%', valueColor: AMBER, sub: 'High Risk' },
          { label: 'Data Protection', value: '41%', valueColor: RED, sub: 'High Risk' },
          { label: 'Device & Network', value: '40%', valueColor: RED, sub: 'Highest Priority' },
        ]),
        para('', { after: 200 }),
        heading2('2.2  Critical Vulnerabilities'),
        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'Device & Network Security — 40%', font: 'Arial', size: 22, bold: true, color: RED })] }),
        bullet('Insufficient patch management and delayed security updates across devices.'),
        bullet('No network segmentation between staff and guest devices.'),
        bullet('Endpoint protection coverage is incomplete.'),
        bullet('Risk: One compromised device may allow access to the wider network.'),
        para('', { after: 40 }),
        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'Data Protection — 41%', font: 'Arial', size: 22, bold: true, color: RED })] }),
        bullet('Backups exist but restoration testing is not routine.'),
        bullet('Encryption controls are inconsistent.'),
        bullet('No formal data inventory of sensitive information.'),
        bullet('Risk: Data loss, breach exposure, and possible compliance penalties.'),
        divider(),

        heading1('3. Category Breakdown'),
        para('The chart below shows performance across all five assessed security domains.', { after: 200 }),
        barChart(DATA.categories),
        divider(),

        heading1('4. Recommendations'),
        para('The recommendations below are prioritized by urgency and expected impact.', { after: 160 }),
        heading2('Priority 1 — Immediate (Weeks 1–2)', RED),
        bullet('Enable multi-factor authentication on all email and cloud accounts.'),
        bullet('Patch all devices and critical software within a 14-day standard.'),
        bullet('Verify antivirus is active on all endpoints.'),
        heading2('Priority 2 — Short-Term (Weeks 2–4)', AMBER),
        bullet('Run a 30-minute phishing awareness training for all staff.'),
        bullet('Publish a one-page incident response checklist and contact sheet.'),
        heading2('Priority 3 — Medium-Term (Weeks 3–5)', GREEN),
        bullet('Test backup restoration and document results.'),
        bullet('Separate guest and staff Wi-Fi networks and enforce WPA2/WPA3.'),
        divider(),

        heading1('5. 30-Day Action Plan'),
        para('This schedule organizes work by risk impact and completion timeline.', { after: 200 }),
        actionTable([
          { priority: '1', label: 'Enable MFA', category: 'Access Control', desc: 'Activate two-step login for all email and cloud accounts.', week: 'Week 1' },
          { priority: '1', label: 'Patch Devices', category: 'Device & Network', desc: 'Audit and apply all pending OS and software updates.', week: 'Week 1' },
          { priority: '2', label: 'Security Training', category: 'Security Awareness', desc: 'Deliver a short phishing-awareness session for all staff.', week: 'Week 2' },
          { priority: '2', label: 'Incident Checklist', category: 'Incident Response', desc: 'Create a one-page response checklist with contacts.', week: 'Week 3' },
          { priority: '3', label: 'Test Backups', category: 'Data Protection', desc: 'Perform and verify one full restoration test.', week: 'Week 4' },
        ]),
        divider(),

        heading1('6. Strengths'),
        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: 'Access Control — 78%  (Strong)', font: 'Arial', size: 24, bold: true, color: GREEN })] }),
        bullet('MFA coverage is a strong baseline control.'),
        bullet('Account offboarding is functioning effectively.'),
        bullet('Least-privilege access principles are in place.'),
        divider(),

        heading1('7. Next Steps'),
        para('Recommended immediate actions:', { after: 120 }),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { before: 60, after: 80 }, children: [txt('Share this report with leadership and assign owners.', { bold: true })] }),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { before: 60, after: 80 }, children: [txt('Kick off Priority 1 items this week with IT support.')] }),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { before: 60, after: 80 }, children: [txt('Re-assess in 60-90 days to measure improvement.')] }),
        para('', { after: 300 }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: '- End of Report -', font: 'Arial', size: 20, color: GRAY3, italics: true })] }),
      ],
    },
  ],
});

const outputDir = path.resolve(__dirname, '..', 'outputs');
const outputFile = path.join(outputDir, 'CyberPosture-Assessment-Report-JST-Org.docx');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(outputFile, buffer);
    console.log(`Done: ${outputFile}`);
  })
  .catch((err) => {
    console.error('Failed to generate report:', err);
    process.exitCode = 1;
  });
