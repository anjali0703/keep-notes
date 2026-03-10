const express = require("express");
const router = express.Router();
const CryptoJS = require("crypto-js");
const User = require("../models/User");

const secretKey = "mySecretKey123!@#";

const encryptPassword = (plainPassword) => CryptoJS.AES.encrypt(plainPassword, secretKey).toString();
const decryptPassword = (encryptedPassword) => CryptoJS.AES.decrypt(encryptedPassword, secretKey).toString(CryptoJS.enc.Utf8);

// Get all users
router.get("/allusers", async (req, res) => {
  try {
    const users = await User.find({ deleted: false }).populate("userTypeId");
    const decryptedUsers = users.map(user => ({ ...user._doc, password: decryptPassword(user.password) }));
    res.status(200).json(decryptedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get users excluding SUPERADMIN
router.get("/", async (req, res) => {
  try {
    const excludedUserTypeId = process.env.SUPERADMIN_ID || "";
    const users = await User.find({ deleted: false, userTypeId: { $ne: excludedUserTypeId } }).populate("userTypeId");
    const decryptedUsers = users.map(user => ({ ...user._doc, password: decryptPassword(user.password) }));
    res.status(200).json(decryptedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const excludedUserTypeId = process.env.SUPERADMIN_ID || "";

    const users = await User.find({
      deleted: false,
      userTypeId: { $ne: excludedUserTypeId },
      $or: [{ _id: userId }, { createdBy: userId }, { parentId: userId }],
    }).populate("userTypeId");

    const decryptedUsers = users.map(user => ({ ...user._doc, password: decryptPassword(user.password) }));
    res.status(200).json(decryptedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Add new user
router.post("/add", async (req, res) => {
  try {
    const { password, email, createdBy, ...rest } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(200).json({ warning: "User with this email already exists." });

    const encryptedPassword = encryptPassword(password);
    const user = new User({ ...rest, email, password: encryptedPassword, createdBy, createdDateTime: new Date() });
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit user
router.put("/edit/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    const { name, email, password, confirmPassword, mobile, userTypeId, modifiedBy } = req.body;

    if (password && password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match" });

    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) return res.status(200).json({ warning: "User with this email already exists." });

    const updateData = { name, email, mobile, userTypeId, modifiedBy, modifiedDateTime: new Date() };
    if (password) updateData.password = encryptPassword(password);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.post("/delete", async (req, res) => {
  try {
    const { userId, deletedBy } = req.body;
    await User.findByIdAndUpdate(userId, { deleted: true, active: false, deletedBy, deletedDateTime: new Date() });
    res.status(200).json({ message: "User marked as deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;