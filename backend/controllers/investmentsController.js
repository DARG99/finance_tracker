const db = require("../config/db");
const { getCurrentPrice } = require("../services/yahooFinance");
require("dotenv").config();

const addInvestment = async (req, res) => {
  const { name, ticker } = req.body;
  const userId = req.user.id;

  try {
    const currentPrice = await getCurrentPrice(ticker);

    if (currentPrice === null) {
      return res.status(400).json({ error: "Invalid ticker symbol" });
    }
    await db.query(
      "INSERT INTO investments (user_id, name, ticker) VALUES ($1, $2, $3)",
      [userId, name, ticker]
    );

    res.status(201).json({ message: "Investment added successfully" });
  } catch (error) {
    console.error("Erro ao adicionar o investimento", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getPrice = async (req, res) => {
  const { ticker } = req.params;

  try {
    const price = await getCurrentPrice(ticker);
    res.json({ ticker, currentPrice: price });
  } catch (error) {
    console.error("Erro ao buscar o preço", error);
    res.status(500).json({ error: "Failed to fetch price" });
  }
};

const getInvestments = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      "SELECT * FROM investments WHERE user_id = $1",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching investments", error);
    res.status(500).json({ error: "Failed to fetch investments" });
  }
};

const getInvestmentDetails = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const startDate = req.query.start || null;
  const endDate = req.query.end || null;

  try {
    // Validate investment ownership
    const invRes = await db.query(
      "SELECT * FROM investments WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (invRes.rows.length === 0) {
      return res.status(404).json({ error: "Investment not found" });
    }

    const investment = invRes.rows[0];

    // Fetch current price
    const currentPrice = await getCurrentPrice(investment.ticker);
    if (!currentPrice) {
      return res.status(500).json({ error: "Failed to fetch current price" });
    }

    // Stats
    const statRes = await db.query(
      `SELECT
         SUM(CAST(amount_invested AS NUMERIC)) AS total_invested,
         SUM(CAST(amount_invested AS NUMERIC) / CAST(price_per_unit AS NUMERIC)) AS total_units
       FROM investments_transactions
       WHERE investments_id = $1`,
      [id]
    );

    const totalInvested = parseFloat(statRes.rows[0].total_invested || 0);
    const totalUnits = parseFloat(statRes.rows[0].total_units || 0);
    const currentValue = totalUnits * currentPrice;
    const gainLoss = currentValue - totalInvested;
    const gainLossPercent =
      totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

    // Filter clause and values
    let filterClause = "";
    const values = [id];
    let idx = 2;

    if (startDate) {
      filterClause += ` AND date >= $${idx++}`;
      values.push(startDate);
    }
    if (endDate) {
      filterClause += ` AND date <= $${idx++}`;
      values.push(endDate);
    }

    // Count matching transactions
    const countRes = await db.query(
      `SELECT COUNT(*) FROM investments_transactions WHERE investments_id = $1${filterClause}`,
      values
    );
    const totalCount = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Add pagination to values
    values.push(limit);
    values.push(offset);

    // Fetch transactions
    const txRes = await db.query(
      `SELECT id, date, amount_invested::NUMERIC, price_per_unit::NUMERIC, tax::NUMERIC
       FROM investments_transactions
       WHERE investments_id = $1${filterClause}
       ORDER BY date DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values
    );

    const transactions = txRes.rows.map((tx) => {
      const units_bought =
        parseFloat(tx.amount_invested) / parseFloat(tx.price_per_unit);
      const current_value = units_bought * currentPrice;
      const gain_loss = current_value - parseFloat(tx.amount_invested);
      const gain_loss_percent =
        parseFloat(tx.amount_invested) > 0
          ? (gain_loss / parseFloat(tx.amount_invested)) * 100
          : 0;

      return {
        id: tx.id,
        date: tx.date,
        amount_invested: parseFloat(tx.amount_invested),
        price_per_unit: parseFloat(tx.price_per_unit),
        tax: parseFloat(tx.tax || 0),
        units_bought,
        current_price: currentPrice,
        current_value,
        gain_loss,
        gain_loss_percent,
      };
    });

    res.json({
      stats: {
        totalInvested,
        totalUnits,
        currentPrice,
        currentValue,
        gainLoss,
        gainLossPercent,
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
      },
      transactions,
    });
  } catch (error) {
    console.error("Error fetching investment details:", error);
    res.status(500).json({ error: "Failed to fetch investment details" });
  }
};

const updateTransaction = async (req, res) => {
  const { investmentId, transactionId } = req.params;
  const { date, amount_invested, price_per_unit, tax = 0 } = req.body;
  const userId = req.user.id; // from JWT token

  try {
    // First ensure the investment belongs to the user
    const result = await db.query(
      `SELECT * FROM investments WHERE id = $1 AND user_id = $2`,
      [investmentId, userId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Investment not found or not authorized" });
    }

    // Now update the transaction
    const updateRes = await db.query(
      `UPDATE investments_transactions
       SET date = $1, amount_invested = $2, price_per_unit = $3, tax = $4
       WHERE id = $5 AND investments_id = $6
       RETURNING *`,
      [date, amount_invested, price_per_unit, tax, transactionId, investmentId]
    );

    if (updateRes.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Transaction not found for this investment" });
    }

    res.json(updateRes.rows[0]);
  } catch (err) {
    console.error("Error updating transaction:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const addInvestmentTransaction = async (req, res) => {
  const userId = req.user.id;
  const { investmentId } = req.params;
  const { date, amount_invested, price_per_unit, tax = 0 } = req.body;

  try {
    // Verify investment ownership
    const result = await db.query(
      "SELECT * FROM investments WHERE id = $1 AND user_id = $2",
      [investmentId, userId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Investment not found or not authorized" });
    }

    // Insert new transaction
    await db.query(
      `INSERT INTO investments_transactions 
        (investments_id, date, amount_invested, price_per_unit, tax)
       VALUES ($1, $2, $3, $4, $5)`,
      [investmentId, date, amount_invested, price_per_unit, tax]
    );

    res.status(201).json({ message: "Transaction added successfully" });
  } catch (err) {
    console.error("Error adding investment transaction:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add this near your other controller functions
const deleteInvestmentTransaction = async (req, res) => {
  const { investmentId, transactionId } = req.params;
  const userId = req.user.id;

  try {
    // Check that the investment belongs to the current user
    const checkOwnership = await db.query(
      "SELECT * FROM investments WHERE id = $1 AND user_id = $2",
      [investmentId, userId]
    );

    if (checkOwnership.rowCount === 0) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this transaction" });
    }

    // Delete the transaction
    const result = await db.query(
      "DELETE FROM investments_transactions WHERE id = $1 AND investments_id = $2",
      [transactionId, investmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting investment transaction:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  addInvestment,
  getPrice,
  getInvestments,
  getInvestmentDetails,
  updateTransaction,
  addInvestmentTransaction,
  deleteInvestmentTransaction,  
};
