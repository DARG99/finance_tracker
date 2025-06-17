const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Database connected. Server time:", res.rows[0].now);
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // Exit if DB connection fails
  }
})();

pool.on("connect", () => {
  console.log("Connection pool estabelecida");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
