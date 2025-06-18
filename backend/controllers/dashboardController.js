const db = require("../config/db");

const getMonthlyDashboard = async (req, res) => {
  const userId = req.user.id;
  const year = parseInt(req.query.year);

  try {
    // Get monthly breakdown for selected year
    const monthlyResult = await db.query(
      `
      SELECT
        TO_CHAR(transaction_date, 'Month') AS month,
        EXTRACT(MONTH FROM transaction_date)::int AS month_num,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)::float AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::float AS expenses
      FROM transactions
      WHERE user_id = $1 AND EXTRACT(YEAR FROM transaction_date) = $2
      GROUP BY month, month_num
      ORDER BY month_num;
    `,
      [userId, year]
    );

    // Get all-time totals (removed year filter)
    const allTimeTotalResult = await db.query(
      `
      SELECT
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)::float AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::float AS total_expenses
      FROM transactions
      WHERE user_id = $1
    `,
      [userId]
    );

    // Get monthly totals for selected year
    const monthlyTotalsResult = await db.query(
      `
      SELECT
        EXTRACT(MONTH FROM transaction_date)::int AS month_num,
        TO_CHAR(transaction_date, 'Month') AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)::float AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::float AS total_expenses
      FROM transactions
      WHERE user_id = $1 AND EXTRACT(YEAR FROM transaction_date) = $2
      GROUP BY month_num, month
      ORDER BY month_num;
    `,
      [userId, year]
    );

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("default", { month: "long" }),
      income: 0,
      expenses: 0,
    }));

    monthlyResult.rows.forEach((row) => {
      months[row.month_num - 1] = {
        month: row.month.trim(),
        income: row.income,
        expenses: row.expenses,
      };
    });

    // Format monthly totals
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("default", { month: "long" }),
      total_income: 0,
      total_expenses: 0,
    }));

    monthlyTotalsResult.rows.forEach((row) => {
      monthlyTotals[row.month_num - 1] = {
        month: row.month.trim(),
        total_income: row.total_income,
        total_expenses: row.total_expenses,
      };
    });

    res.json({
      monthly: months,
      yearlyTotal: {
        total_income: allTimeTotalResult.rows[0].total_income || 0,
        total_expenses: allTimeTotalResult.rows[0].total_expenses || 0,
      },
      monthlyTotals: monthlyTotals
    });
  } catch (err) {
    console.error("Error fetching monthly dashboard", err);
    res.status(500).json({ error: "Failed to fetch monthly dashboard" });
  }
};

const getYearlyDashboard = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `
      SELECT
        EXTRACT(YEAR FROM transaction_date)::int AS year,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)::float AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::float AS expenses
      FROM transactions
      WHERE user_id = $1
      GROUP BY year
      ORDER BY year;
    `,
      [userId]
    );

    // Calculate total across all years
    const totalResult = await db.query(
      `
      SELECT
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)::float AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::float AS total_expenses
      FROM transactions
      WHERE user_id = $1
    `,
      [userId]
    );

    res.json({
      yearly: result.rows,
      total: {
        total_income: totalResult.rows[0].total_income || 0,
        total_expenses: totalResult.rows[0].total_expenses || 0,
      }
    });
  } catch (err) {
    console.error("Error fetching yearly dashboard", err);
    res.status(500).json({ error: "Failed to fetch yearly dashboard" });
  }
};

const getInvestmentsSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `
      SELECT 
        i.ticker,
        SUM(it.amount_invested)::float AS amountInvested,
        (
          SELECT current_price FROM cached_prices WHERE ticker = i.ticker
        ) AS currentPrice
      FROM investments i
      JOIN investments_transactions it ON it.investments_id = i.id
      WHERE i.user_id = $1
      GROUP BY i.ticker
    `,
      [userId]
    );

    const investments = result.rows.map((inv) => {
      const totalUnits = inv.amountinvested / inv.currentprice;
      const currentValue = totalUnits * inv.currentprice;
      const gainLoss = currentValue - inv.amountinvested;
      return {
        ticker: inv.ticker,
        amountInvested: inv.amountinvested,
        gainLoss: gainLoss,
      };
    });

    res.json(investments);
  } catch (err) {
    console.error("Error fetching investment summary", err);
    res.status(500).json({ error: "Failed to fetch investment summary" });
  }
};

const getTransferCategories = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `
      SELECT 
        c.name as category,
        SUM(t.amount)::float as total_amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 AND t.type = 'transfer'
      GROUP BY c.name
      ORDER BY total_amount DESC;
    `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching transfer categories", err);
    res.status(500).json({ error: "Failed to fetch transfer categories" });
  }
};

module.exports = {
  getMonthlyDashboard,
  getYearlyDashboard,
  getInvestmentsSummary,
  getTransferCategories,
};
