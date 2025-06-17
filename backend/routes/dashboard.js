const express = require("express");
const router = express.Router();
const {
  getMonthlyDashboard,
  getYearlyDashboard,
  getInvestmentsSummary,
  getTransferCategories,
} = require("../controllers/dashboardController");
const authenticateUser = require("../middleware/auth");

router.get("/monthly", authenticateUser, getMonthlyDashboard);
router.get("/yearly", authenticateUser, getYearlyDashboard);
router.get("/investments-summary", authenticateUser, getInvestmentsSummary);
router.get("/transfer-categories", authenticateUser, getTransferCategories);

module.exports = router;
