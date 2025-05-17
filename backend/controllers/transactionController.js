const db = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const addTransaction = async (req, res) => {
  const { amount, type, description, transaction_date, categoryid } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      "INSERT INTO transactions (user_id, amount, type, description, transaction_date, category_id) VALUES ($1,$2,$3,$4,$5,$6)",
      [userId, amount, type, description, transaction_date, categoryid]
    );

    res.status(201).json({ message: "Transaction added successfully" });
  } catch (error) {
    console.error("Erro a adicionar a transação", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT 
       t.id,
       t.amount::float,
       t.type,
       t.description,
       t.transaction_date,
       t.category_id,      
       c.name AS category
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE t.user_id = $1
     ORDER BY t.transaction_date DESC, t.id DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching transactions", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

const updateTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;
  const { amount, type, description, transaction_date, categoryid } = req.body;

  try {
    console.log("Received update data:", req.body);

    const result = await db.query(
      `UPDATE transactions
        SET amount = $1, type = $2, description = $3, transaction_date = $4, category_id = $5
       WHERE id = $6 AND user_id = $7`,
      [
        amount,
        type,
        description,
        transaction_date,
        categoryid,
        transactionId,
        userId,
      ]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Transaction not found or not authorized" });
    }

    res.status(200).json({ message: "Transaction updated successfully" });
  } catch (error) {
    console.error("Error updating transaction", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
};