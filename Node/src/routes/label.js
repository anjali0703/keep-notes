const router = require('express').Router();
const Label = require('../models/Label');
const Note = require('../models/Note');

// 1. GET ALL LABELS FOR A USER
router.get('/:userId', async (req, res) => {
  const labels = await Label.find({ userId: req.params.userId });
  res.json(labels);
});

// 2. CREATE NEW LABEL
router.post('/', async (req, res) => {
  try {
    const newLabel = new Label(req.body);
    await newLabel.save();
    res.json(newLabel);
  } catch (err) { res.status(400).json("Label already exists"); }
});

// 3. RENAME LABEL (The "Keep" Logic)
router.put('/rename', async (req, res) => {
  const { userId, oldName, newName } = req.body;
  
  // Update the Label entry
  await Label.findOneAndUpdate({ userId, name: oldName }, { name: newName });
  
  // Update all notes that contain the old label name
  // This replaces 'oldName' with 'newName' inside the labels array
  await Note.updateMany(
    { userId, labels: oldName },
    { $set: { "labels.$": newName } }
  );
  
  res.json({ success: true });
});

// 4. DELETE LABEL
router.delete('/:userId/:name', async (req, res) => {
  const { userId, name } = req.params;
  await Label.findOneAndDelete({ userId, name });
  // Remove the label from all notes but DON'T delete the notes
  await Note.updateMany({ userId }, { $pull: { labels: name } });
  res.json("Deleted");
});

module.exports = router;