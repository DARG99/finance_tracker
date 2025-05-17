const express = require("express");
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  updateTransaction,
} = require("../controllers/transactionController");
const authenticateUser = require("../middleware/auth");

router.post("/addtransaction", authenticateUser, addTransaction);
router.get("/", authenticateUser, getTransactions);
router.put("/:id", authenticateUser, updateTransaction);
module.exports = router;
