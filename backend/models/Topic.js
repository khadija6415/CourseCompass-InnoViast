const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
}, { timestamps: true });

topicSchema.index({ course: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);