const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const userModel = require("../models/User");

// Replace with your actual secret key or an environment variable
const SECRET_KEY = process.env.SECRET_KEY || "YOUR_SECRET_KEY";

// Middleware to authenticate a user using JWT
const authenticateUser = (req, res, next) => {
  const token = req.cookies && req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. No token provided." });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = decoded; // Attach decoded user info to request
    next();
  });
};

// Protected route: Get User Profile
router.get("/users/profile", authenticateUser, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Forgot Password Endpoint
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token and expiry (1 hour from now)
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    // Configure Nodemailer (example using Gmail; update as needed)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { 
        user: "your-email@gmail.com", 
        pass: "your-email-password" 
      },
    });

    // Construct reset link (update the URL to match your frontend)
    const resetLink = `https://deploycapstone.onrender.com/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error("Error in forgot password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password Endpoint
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find the user with a valid reset token that hasn't expired
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // In production, make sure to hash the new password before saving
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error in reset password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
