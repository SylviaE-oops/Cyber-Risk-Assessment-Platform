/**
 * aiService.js
 * Simulates an AI-powered recommendation engine.
 * Maps each questionnaire answer to a risk score and generates
 * prioritised recommendations without requiring an external API key.
 */

// ---------- Scoring table ----------
// Yes = secure (0 pts), Partial = some risk (5 pts), No = full risk (10 pts)
const SCORE_MAP = { yes: 0, partial: 5, no: 10 };

// ---------- Question metadata ----------
// Each entry holds the answer key, human-readable label, and the
// recommendation text that surfaces when the answer is not "Yes".
const QUESTIONS = [
  {
    key: 'mfa',
    label: 'Multi-Factor Authentication',
    recommendations: {
      no: {
        priority: 'high',
        title: 'Enable Multi-Factor Authentication (MFA)',
        explanation:
          'MFA adds a second layer of identity verification, drastically reducing the risk of account compromise even if passwords are stolen. Enable it on all critical accounts immediately.',
      },
      partial: {
        priority: 'medium',
        title: 'Extend Multi-Factor Authentication Coverage',
        explanation:
          'MFA is only partially deployed. Roll it out to all user accounts and systems to eliminate remaining single-factor entry points.',
      },
    },
  },
  {
    key: 'backups',
    label: 'Regular Data Backups',
    recommendations: {
      no: {
        priority: 'high',
        title: 'Implement a Data Backup Strategy',
        explanation:
          'Without regular backups, a ransomware attack or hardware failure could permanently destroy critical data. Adopt the 3-2-1 rule: 3 copies, 2 different media, 1 offsite.',
      },
      partial: {
        priority: 'medium',
        title: 'Strengthen Your Backup Process',
        explanation:
          'Backups exist but are incomplete or untested. Ensure all critical data is covered and run restore drills quarterly.',
      },
    },
  },
  {
    key: 'firewall',
    label: 'Firewall Protection',
    recommendations: {
      no: {
        priority: 'high',
        title: 'Deploy a Firewall Immediately',
        explanation:
          'Operating without a firewall exposes your network to external threats. Install and configure a firewall to control inbound and outbound traffic.',
      },
      partial: {
        priority: 'medium',
        title: 'Review and Tighten Firewall Rules',
        explanation:
          'Your firewall is only partially configured. Audit existing rules, close unnecessary ports, and apply a default-deny policy.',
      },
    },
  },
  {
    key: 'updates',
    label: 'Regular System Updates / Patching',
    recommendations: {
      no: {
        priority: 'high',
        title: 'Establish a Patch Management Process',
        explanation:
          'Unpatched systems are the most exploited attack vector. Set up automated updates or a monthly patch cycle covering OS, applications, and firmware.',
      },
      partial: {
        priority: 'medium',
        title: 'Automate and Expand Patching Coverage',
        explanation:
          'Some systems are being patched but coverage is incomplete. Automate updates where possible and track outstanding patches with a vulnerability scanner.',
      },
    },
  },
  {
    key: 'antivirus',
    label: 'Antivirus / Endpoint Protection',
    recommendations: {
      no: {
        priority: 'high',
        title: 'Install Endpoint Protection Software',
        explanation:
          'Endpoints without antivirus are easy targets for malware. Deploy a reputable endpoint detection and response (EDR) solution across all devices.',
      },
      partial: {
        priority: 'medium',
        title: 'Ensure Full Endpoint Protection Coverage',
        explanation:
          'Not all endpoints are protected. Inventory every device and ensure antivirus / EDR is installed, updated, and actively scanning.',
      },
    },
  },
  {
    key: 'passwordPolicy',
    label: 'Strong Password Policy',
    recommendations: {
      no: {
        priority: 'high',
        title: 'Enforce a Strong Password Policy',
        explanation:
          'Weak passwords are trivially cracked. Require a minimum of 12 characters, complexity rules, and mandate the use of a password manager across the organisation.',
      },
      partial: {
        priority: 'medium',
        title: 'Strengthen and Enforce Password Requirements',
        explanation:
          'A password policy exists but is not consistently enforced. Use technical controls (Group Policy, identity provider settings) to prevent weak passwords.',
      },
    },
  },
  {
    key: 'accessControl',
    label: 'Role-Based Access Control (RBAC)',
    recommendations: {
      no: {
        priority: 'high',
        title: 'Implement Least-Privilege Access Control',
        explanation:
          'Without RBAC, users may have unnecessary access to sensitive systems. Apply the principle of least privilege — grant only the minimum permissions required for each role.',
      },
      partial: {
        priority: 'medium',
        title: 'Complete Access Control Implementation',
        explanation:
          'Access controls are partially in place. Review all roles and permissions, remove excessive privileges, and audit access logs regularly.',
      },
    },
  },
  {
    key: 'incidentResponse',
    label: 'Incident Response Plan',
    recommendations: {
      no: {
        priority: 'high',
        title: 'Create an Incident Response Plan',
        explanation:
          'Without a plan, a breach can spiral out of control. Document roles, escalation paths, containment steps, and recovery procedures, then test the plan with a tabletop exercise.',
      },
      partial: {
        priority: 'medium',
        title: 'Formalise and Test the Incident Response Plan',
        explanation:
          'A partial plan exists. Expand it to cover all incident types, assign clear ownership, and run a simulation exercise to identify gaps.',
      },
    },
  },
  {
    key: 'securityTraining',
    label: 'Employee Security Awareness Training',
    recommendations: {
      no: {
        priority: 'medium',
        title: 'Launch Security Awareness Training',
        explanation:
          'Human error is the top cause of breaches. Introduce mandatory annual security training covering phishing, social engineering, and safe data handling.',
      },
      partial: {
        priority: 'low',
        title: 'Expand Security Training Coverage',
        explanation:
          'Training exists for some staff. Make it mandatory for everyone and add phishing simulations to reinforce awareness throughout the year.',
      },
    },
  },
  {
    key: 'encryption',
    label: 'Data Encryption (at rest & in transit)',
    recommendations: {
      no: {
        priority: 'medium',
        title: 'Encrypt Sensitive Data',
        explanation:
          'Unencrypted data is readable if stolen. Enable full-disk encryption on all devices and enforce TLS/HTTPS for all data in transit.',
      },
      partial: {
        priority: 'low',
        title: 'Extend Encryption to All Data',
        explanation:
          'Encryption is applied in some areas. Ensure every sensitive data store and communication channel is encrypted end-to-end.',
      },
    },
  },
];

// ---------- Core service function ----------
/**
 * assessRisk
 * @param {Object} answers - Map of question key → "yes" | "no" | "partial"
 * @returns {{ score: number, riskLevel: string, recommendations: { high: Array, medium: Array, low: Array } }}
 */
function assessRisk(answers) {
  // Normalise all answer values to lowercase for consistent comparison
  const normalised = {};
  for (const [key, value] of Object.entries(answers)) {
    normalised[key] = (value || '').toLowerCase();
  }

  let totalScore = 0;
  const recommendations = { high: [], medium: [], low: [] };

  for (const question of QUESTIONS) {
    const answer = normalised[question.key];

    // Skip questions not included in this assessment
    if (answer === undefined) continue;

    // Add to score
    const points = SCORE_MAP[answer] ?? 0;
    totalScore += points;

    // Attach recommendation if answer is not "yes"
    if (answer !== 'yes' && question.recommendations[answer]) {
      const rec = question.recommendations[answer];
      recommendations[rec.priority].push({
        title: rec.title,
        explanation: rec.explanation,
      });
    }
  }

  // Cap score at 100 in case more questions are answered than the base 10
  const score = Math.min(totalScore, 100);

  // Categorise risk level
  let riskLevel;
  if (score <= 30) {
    riskLevel = 'Low';
  } else if (score <= 70) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'High';
  }

  // Add a generic low-priority recommendation when overall posture is good
  if (score <= 30) {
    recommendations.low.push({
      title: 'Maintain and Review Your Security Posture',
      explanation:
        'Your current security posture is strong. Schedule a quarterly review to ensure controls remain effective as your environment evolves.',
    });
  }

  return { score, riskLevel, recommendations };
}

module.exports = { assessRisk };
