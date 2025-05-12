const db = require("../config/db");
require("dotenv").config();

const getCategories = async (req,res) => {
  try {
    const result = await db.query("SELECT * FROM categories");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching categories", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

module.exports ={
    getCategories
}
