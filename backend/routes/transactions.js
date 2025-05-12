const express = require ('express');
const router = express.Router();
const {addTransaction, getTransactions} = require('../controllers/transactionController');
const authenticateUser = require('../middleware/auth');

router.post("/addtransaction", authenticateUser,addTransaction)
router.get ('/',authenticateUser, getTransactions)
module.exports = router;