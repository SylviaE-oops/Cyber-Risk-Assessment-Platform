/**
 * assessmentRoutes.js
 * Defines the API routes for the assessment feature.
 */

const express = require('express');
const router = express.Router();
const { assess } = require('../controllers/assessmentController');

// POST /api/assess — submit questionnaire answers and receive risk report
router.post('/assess', assess);

module.exports = router;
