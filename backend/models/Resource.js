const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  source: { type: String, default: 'YouTube', trim: true },
  thumbnail: { type: String, trim: true },
  durationMinutes: { type: Number },
  matchStatus: { type: String, enum: ['match', 'extra', 'missing'], required: true },
  covers: [{ type: String, trim: true }],
  missing: [{ type: String, trim: true }],
  notes: { type: String, trim: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);