const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const sendReminderEmail = require("../utils/sendReminderEmail");

// POST /api/reminder/email
router.post("/email", async (req, res) => {
  try {
    const { noteId } = req.body;

    // Populate userId to get the email
    const note = await Note.findById(noteId).populate("userId");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (!note.userId || !note.userId.email) {
      return res.status(400).json({ message: "User email not found" });
    }

    // Send email
    await sendReminderEmail(
      note.userId.email,          // use email from User
      note.title || note.content,
      note.reminder.date
    );

    // Mark email as sent
    note.reminder.emailSent = true;
    await note.save();

    res.json({ success: true, message: `Email sent to ${note.userId.email}` });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Email failed" });
  }
});

module.exports = router;