const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userCheck = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
      },
      token,
    });
  } catch (error) {
    console.error("Erro a registar o utilizador", error);
    res.status(500).json({ error: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "INVALID CREDENTIALS" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "INVALID CREDENTIALS" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: email.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const getUserProfile = async (req, res) => {
    try {
      const result = await db.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [req.user.id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const user = result.rows[0];
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
