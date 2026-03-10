const express = require("express");
const router = express.Router();
const UserType = require("../models/UserType");

// Add new user type
router.post("/add", async (req, res) => {
  try {
    const { typeId, typeName } = req.body;
    const userType = new UserType({ typeId, typeName });
    await userType.save();
    res.status(201).json({ message: "User Type added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active user types
router.get("/", async (req, res) => {
  try {
    const types = await UserType.find({ deleted: false, active: true });
    res.status(200).json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;