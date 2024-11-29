const bcrypt = require("bcrypt");
const db = require("../models/db");
const { generateToken, verifyToken } = require("../utils/tokenUtils");
const sendEmail = require("../utils/emailService");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateToken({ email }, "1d");

    const [result] = await db.query(
      "INSERT INTO users (name, email, password, verification_token) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, verificationToken]
    );

    await sendEmail(
      email,
      "Verify Your Email",
      `<a href="${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}">Verify Email</a>`
    );

    res
      .status(201)
      .json({ message: "Signup successful. Please verify your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const { email } = verifyToken(token);

    await db.query(
      "UPDATE users SET is_verified = 1, verification_token = NULL WHERE email = ?",
      [email]
    );

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0)
      return res.status(404).json({ error: "User not found." });

    const user = rows[0];

    if (!user.is_verified)
      return res.status(403).json({ error: "Email not verified." });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid password." });

    const token = generateToken({ id: user.id, isAdmin: user.is_admin });

    res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const resetToken = generateToken({ email }, "1h");

    await db.query("UPDATE users SET verification_token = ? WHERE email = ?", [
      resetToken,
      email,
    ]);

    await sendEmail(
      email,
      "Reset Your Password",
      `<a href="${process.env.BASE_URL}/auth/reset-password?token=${resetToken}">Reset Password</a>`
    );

    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  try {
    const { email } = verifyToken(token);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = ?, verification_token = NULL WHERE email = ?",
      [hashedPassword, email]
    );

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token." });
  }
};
