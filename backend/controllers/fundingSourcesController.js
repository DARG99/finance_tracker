const db = require("../config/db");
require("dotenv").config();

// Get all funding sources for a specific user
const getFundingSources = async (req, res) => {
  const userId = req.user.id; // assuming you have authentication middleware that sets req.user
  try {
    const result = await db.query(
      "SELECT id, name FROM funding_sources WHERE user_id = $1 ORDER BY name",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching funding sources", error);
    res.status(500).json({ error: "Failed to fetch funding sources" });
  }
};

// Add a new funding source
const createFundingSource = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO funding_sources (user_id, name)
       VALUES ($1, $2)
       RETURNING id, name`,
      [userId, name || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating funding source", error);
    res.status(500).json({ error: "Failed to create funding source" });
  }
};

// Optional: delete a funding source
const deleteFundingSource = async (req, res) => {
  const userId = req.user.id;
  const sourceId = req.params.id;

  try {
    await db.query(
      "DELETE FROM funding_sources WHERE id = $1 AND user_id = $2",
      [sourceId, userId]
    );
    res.status(200).json({ message: "Funding source deleted" });
  } catch (error) {
    console.error("Error deleting funding source", error);
    res.status(500).json({ error: "Failed to delete funding source" });
  }
};

module.exports = {
  getFundingSources,
  createFundingSource,
  deleteFundingSource,
};
