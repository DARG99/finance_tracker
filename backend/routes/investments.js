const express = require("express");
const router = express.Router();
const {
  addInvestment,
  getPrice,
  getInvestments,
  getInvestmentDetails,
  updateTransaction,
  addInvestmentTransaction,
  deleteInvestmentTransaction,
} = require("../controllers/investmentsController");
const authenticateUser = require("../middleware/auth");

router.post("/", authenticateUser, addInvestment);
router.get("/price/:ticker", authenticateUser, getPrice);
router.get("/", authenticateUser, getInvestments);
router.get("/:id/details", authenticateUser, getInvestmentDetails);
router.put(
  "/:investmentId/transactions/:transactionId",
  authenticateUser,
  updateTransaction
);
router.post(
  "/:investmentId/transactions",
  authenticateUser,
  addInvestmentTransaction
);
router.delete(
  "/:investmentId/transactions/:transactionId",
  authenticateUser,
  deleteInvestmentTransaction
);

module.exports = router;
