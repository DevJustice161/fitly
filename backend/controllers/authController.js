const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  const { name, email, address, password, phone } = req.body;

  try {
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (name,email, address,password,phone,role)
       VALUES (?,?,?,?,?,?)`,
      [name, email, address, hashedPassword, phone, "customer"],
    );

    const token = jwt.sign(
      { id: result.insertId, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Registration successful",
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: "customer",
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (user.length === 0)
      return res.status(400).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user[0].password);

    if (!validPassword)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET);

    res.json({
      message: "Login successful",
      token,
      user: user[0],
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
