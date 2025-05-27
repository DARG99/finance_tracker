const db = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const addTransaction = async (req, res) => {
  const {
    amount,
    type,
    description,
    transaction_date,
    categoryid,
    funding_source_id,
  } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      `INSERT INTO transactions (user_id, amount, type, description, transaction_date, category_id, funding_source_id)
   VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        userId,
        amount,
        type,
        description,
        transaction_date,
        categoryid,
        funding_source_id,
      ]
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
    const { page = 1, limit = 10, search = "", category = "" } = req.query;

    const offset = (page - 1) * limit;

    // Build dynamic WHERE clauses
    const filters = [`t.user_id = $1`];
    const values = [userId];
    let paramIndex = values.length;

    if (category) {
      paramIndex++;
      filters.push(`c.name = $${paramIndex}`);
      values.push(category);
    }

    if (search) {
      paramIndex++;
      filters.push(
        `LOWER(t.description) LIKE LOWER('%' || $${paramIndex} || '%')`
      );
      values.push(search);
    }

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // Query for paginated results
    const transactionsQuery = `
      SELECT 
  t.id,
  t.amount::float,
  t.type,
  t.description,
  t.transaction_date,
  t.category_id,
  c.name AS category,
  fs.id AS funding_source_id,
  fs.name AS funding_source
FROM transactions t
JOIN categories c ON t.category_id = c.id
LEFT JOIN funding_sources fs ON t.funding_source_id = fs.id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT $${++paramIndex}
      OFFSET $${++paramIndex};
    `;

    values.push(limit, offset);

    const transactionsResult = await db.query(transactionsQuery, values);

    // Query for total count
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${whereClause};
    `;

    const countResult = await db.query(
      countQuery,
      values.slice(0, values.length - 2)
    );

    res.status(200).json({
      transactions: transactionsResult.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching transactions", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

const updateTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;
  const {
    amount,
    type,
    description,
    transaction_date,
    categoryid,
    funding_source_id,
  } = req.body;

  try {
    console.log("Received update data:", req.body);

    const result = await db.query(
      `UPDATE transactions
   SET amount = $1, type = $2, description = $3, transaction_date = $4, category_id = $5, funding_source_id = $6
   WHERE id = $7 AND user_id = $8`,
      [
        amount,
        type,
        description,
        transaction_date,
        categoryid,
        funding_source_id,
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

const deleteTransaction = async (req, res) => {
  try {
    console.log("here");
    const userId = req.user.id; // authenticated user's ID
    const transactionId = req.params.id; // transaction ID from the URL param

    // Delete the transaction where transactionId matches AND userId matches (ownership check)
    const result = await db.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *",
      [transactionId, userId]
    );

    if (result.rowCount === 0) {
      // No rows deleted means either transaction not found or not owned by user
      return res
        .status(404)
        .json({ message: "Transaction not found or not authorized" });
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
      deletedTransaction: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
