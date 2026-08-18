const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  status: { type: String, enum: ['saved', 'in-progress', 'completed'], default: 'saved' },
  completedAt: { type: Date },
}, { timestamps: true });

bookmarkSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);