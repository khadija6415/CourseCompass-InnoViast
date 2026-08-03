const Feedback = require('../models/Feedback');

const addFeedback = async (req, res) => {
  try {
    const { resourceId, type, comment } = req.body;
    if (!resourceId || !type) {
      return res.status(400).json({ message: 'resourceId and type are required' });
    }
    const feedback = await Feedback.findOneAndUpdate(
      { user: req.user._id, resource: resourceId },
      { type, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getFeedbackForResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const helpedCount = await Feedback.countDocuments({ resource: resourceId, type: 'helped' });
    const confusingCount = await Feedback.countDocuments({ resource: resourceId, type: 'confusing' });
    res.json({ helped: helpedCount, confusing: confusingCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addFeedback, getFeedbackForResource };