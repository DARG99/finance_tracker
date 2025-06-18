const express = require('express');
const router = express.Router();
const { generateMonthlyReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');

// Route to generate and send monthly report
router.post('/monthly', auth, generateMonthlyReport);

module.exports = router; 