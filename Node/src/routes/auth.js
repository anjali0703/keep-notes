const express = require("express");
const router = express.Router();
const CryptoJS = require("crypto-js");
const User = require("../models/User");

const secretKey = "mySecretKey123!@#"; // Can also move to env if needed

const encryptPassword = (plainPassword) => {
  return CryptoJS.AES.encrypt(plainPassword, secretKey).toString();
};

const decryptPassword = (encryptedPassword) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, deleted: false });

    if (!user) return res.status(404).json({ message: "User not found" });

    const decryptedPassword = decryptPassword(user.password);

    if (password !== decryptedPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userTypeId: user.userTypeId,
        mobile: user.mobile,
        active: user.active,
        createdBy: user.createdBy,
        createdDateTime: user.createdDateTime,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Waiter login route
router.post("/waiterlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, deleted: false });

    if (!user) return res.status(404).json({ message: "User not found" });

    const decryptedPassword = decryptPassword(user.password);

    if (password !== decryptedPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userTypeId: user.userTypeId,
        mobile: user.mobile,
        active: user.active,
        createdBy: user.createdBy,
        createdDateTime: user.createdDateTime,
      },
    });
  } catch (err) {
    console.error("Waiter login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;