/**
 * assessmentController.js
 * Handles the POST /api/assess request.
 * Validates the incoming answers and delegates scoring/recommendation
 * generation to the AI service.
 */

const { assessRisk } = require('../services/aiService');

// Valid answer values accepted by the platform
const VALID_ANSWERS = new Set(['yes', 'no', 'partial']);

/**
 * POST /api/assess
 * Body: { answers: { [questionKey]: "yes" | "no" | "partial" } }
 */
async function assess(req, res) {
  try {
    const { answers } = req.body;

    // --- Basic validation ---
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({
        error: 'Request body must include an "answers" object.',
      });
    }

    const keys = Object.keys(answers);
    if (keys.length === 0) {
      return res.status(400).json({
        error: 'No answers provided. Please complete the questionnaire.',
      });
    }

    // Validate each answer value
    for (const [key, value] of Object.entries(answers)) {
      if (typeof value !== 'string' || !VALID_ANSWERS.has(value.toLowerCase())) {
        return res.status(400).json({
          error: `Invalid answer "${value}" for question "${key}". Accepted values: yes, no, partial.`,
        });
      }
    }

    // --- Delegate to AI service ---
    const result = assessRisk(answers);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Assessment error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}

module.exports = { assess };
