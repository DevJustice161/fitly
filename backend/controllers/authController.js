const { OAuth2Client } = require("google-auth-library");
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

    const [userAfterInsertion] = await db.query(
      `SELECT * FROM users WHERE id = ?`,
      [result.insertId],
    );

    const regUser = userAfterInsertion[0];

    res.json({
      message: "Registration successful",
      token,
      user: regUser,
    });
  } catch (error) {
    console.log("Error in registerUser:", error);
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

    if (user[0].password == null) {
      return res
        .status(403)
        .json({
          message:
            "You signed up with Google, use the Google Sign in button to login",
        });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (user[0].status !== "active") {
      return res.status(403).json({ message: "User account is not active" });
    }

    if (user[0].role === "vendor") {
      const [vendor] = await db.query(
        "SELECT * FROM vendors WHERE user_id = ?",
        [user[0].id],
      );

      if (vendor.length === 0) {
        return res.status(403).json({ message: "Vendor profile not found" });
      }

      if (vendor[0].v_status !== "Active") {
        return res
          .status(403)
          .json({ message: "Vendor account is not active" });
      }
    }

    if (!validPassword)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
      {
        id: user[0].id,
        role: user[0].role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      message: "Login successful",
      token,
      user: user[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub: googleId, name, email, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({
        message: "Google email is not verified",
      });
    }

    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE google_id = ?",
      [googleId],
    );
    if (existingUsers.length === 0) {
      const [emailUsers] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
      );
      if (emailUsers.length > 0) {
        return res.status(409).json({
          message:
            "An account with this email already exists. Please sign in with your password first, then link Google from your account settings.",
        });
      }
      const [result] = await db.query(
        `INSERT INTO users ( name, email, address, city, state, country, phone, password, role, google_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, "", "", "", "", "", null, "customer", googleId],
      );
      const userId = result.insertId;
      const [userAfterInsertion] = await db.query(
        `SELECT * FROM users WHERE id = ?`,
        [userId],
      );

      const regUser = userAfterInsertion[0];
      const token = jwt.sign(
        {
          id: userId,
          role: "customer",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        },
      );
      return res.status(201).json({
        message: "Google signup successful",
        token,
        user: regUser,
      });
    }

    const user = existingUsers[0];
    if (user.status !== "active") {
      return res.status(403).json({
        message: "User account is not active",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    return res.json({
      message: "Google login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Google authentication error:", error);

    return res.status(401).json({
      message: "Invalid Google credential",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const [users] = await db.query(
      "SELECT id, name, password, email FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      return res.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const user = users[0];

    if (user.password == null && user.google_id != null) {
      return res.json({
        message:
          "You signed in using Google. Please use Google Sign-In to access your account.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      `UPDATE users
       SET reset_password_token = ?,
           reset_password_expires = ?
       WHERE id = ?`,
      [hashedToken, expires, user.id],
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Fitly.ng" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your Fitly.ng password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Reset your Fitly.ng password</h2>

          <p>Hello ${user.name},</p>

          <p>
            We received a request to reset your Fitly.ng password.
          </p>

          <p>
            Click the button below to create a new password:
          </p>

          <p>
            <a
              href="${resetUrl}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#d4a017;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This link will expire in <strong>15 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset, you can safely ignore
            this email.
          </p>

          <p>— Fitly.ng</p>
        </div>
      `,
    });

    return res.json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Unable to process password reset request",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const [users] = await db.query(
      `SELECT id
       FROM users
       WHERE reset_password_token = ?
       AND reset_password_expires > NOW()`,
      [hashedToken],
    );

    if (users.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired password reset link",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users
       SET password = ?,
           reset_password_token = NULL,
           reset_password_expires = NULL
       WHERE id = ?`,
      [hashedPassword, users[0].id],
    );

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Unable to reset password",
    });
  }
};
