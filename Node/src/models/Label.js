const mongoose = require('mongoose');

const LabelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Prevent duplicate label names for the SAME user
LabelSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Label', LabelSchema);