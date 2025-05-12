const db = require("../config/db");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const addTransaction = async (req, res) => {
  const {amount, type, description, transactionDate,categoryid} = req.body;
  const userId = req.user.id

  try {
    await db.query(
      "INSERT INTO transactions (user_id, amount, type, description, transaction_date, category_id) VALUES ($1,$2,$3,$4,$5,$6)",
      [userId, amount, type, description, transactionDate, categoryid]
    );
  

    res.status(201).json({ message: "Transaction added successfully" });
  } catch (error) {
    console.error("Erro a adicionar a transação", error);
    res.status(500).json({ error: "Server error" });
  }
};


const getTransactions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT t.id, t.amount::float, t.type, t.description, t.transaction_date, c.name AS category
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.transaction_date DESC, t.id DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching transactions", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};




module.exports = {
  addTransaction,
  getTransactions
};
