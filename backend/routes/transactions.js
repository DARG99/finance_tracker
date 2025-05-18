const express = require("express");
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} = require("../controllers/transactionController");
const authenticateUser = require("../middleware/auth");

router.post("/addtransaction", authenticateUser, addTransaction);
router.get("/", authenticateUser, getTransactions);
router.put("/:id", authenticateUser, updateTransaction);
router.delete("/:id", authenticateUser,deleteTransaction)
module.exports = router;
