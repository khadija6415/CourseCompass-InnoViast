const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  type: { type: String, enum: ['helped', 'confusing'], required: true },
  comment: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);