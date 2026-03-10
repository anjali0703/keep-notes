const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// 1. Get all notes for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notes = await Note.find({ userId }).sort({ updatedAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. Add new note (Supports both Text and Checklist modes)
router.post("/", async (req, res) => {
  try {
    const { 
      title, content, userId, pinned, color, images, 
      archived, trashed, labels, isList, listItems ,background,reminder
    } = req.body;
    
    const note = new Note({ 
      title, 
      content, 
      userId, 
      pinned: pinned || false, 
      color: color ,
       background: background || "",
      images: images || [],
      labels: labels || [],
      isList: isList || false,
      listItems: listItems || [], // Array of { text: String, checked: Boolean }
      archived: archived || false,
      trashed: trashed || false,
      reminder:reminder||null,
    });
    
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create note" });
  }
});
router.patch("/reminder-toggle/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note || !note.reminder) return res.status(404).json({ error: "Reminder not found" });

    note.reminder.active = !note.reminder.active; // toggle
    note.updatedAt = new Date();
    await note.save();

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle reminder" });
  }
});

// 3. Dynamic Edit note (Handles labels, checklists, and state changes)
router.put("/edit/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
console.log("Updating note:", noteId, updateData);
    // Validate reminder if present
  if (updateData.reminder) {
  const r = updateData.reminder;
  if (!r.date || isNaN(new Date(r.date))) {
    return res.status(400).json({ error: "Invalid reminder date" });
  }
  // Force reminder.date to be a Date object
  updateData.reminder.date = new Date(r.date);
  updateData.reminder.repeat = r.repeat || "none";
  updateData.reminder.active = r.active ?? true;
}

    console.log("Updating note:", noteId, updateData); // debug

    const updatedNote = await Note.findByIdAndUpdate(noteId, updateData, {
      new: true,
    });

    if (!updatedNote) return res.status(404).json({ error: "Note not found" });
    res.status(200).json(updatedNote);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Update failed", details: err.message });
  }
});

// 4. Specific Route: Toggle Checklist Item (Google Notes Optimization)
// This allows you to check/uncheck a single box efficiently
router.patch("/:noteId/check-item/:itemId", async (req, res) => {
  try {
    const { noteId, itemId } = req.params;
    const { checked } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: noteId, "listItems._id": itemId },
      { 
        $set: { "listItems.$.checked": checked },
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle item" });
  }
});

// 5. Permanent Delete
router.delete("/delete/:noteId", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.noteId);
    res.status(200).json({ message: "Note permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;