const express = require('express');
const router = express.Router();
const { generateMonthlyInvestmentReport } = require('../controllers/investmentReportController');
const auth = require('../middleware/auth');

// Route to generate and send monthly investment report
router.post('/monthly', auth, generateMonthlyInvestmentReport);

module.exports = router; 