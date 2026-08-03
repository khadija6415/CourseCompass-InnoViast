const Resource = require('../models/Resource');

const getResourcesByTopic = async (req, res) => {
  try {
    const { topicId, search, matchStatus } = req.query;
    if (!topicId) {
      return res.status(400).json({ message: 'topicId query parameter is required' });
    }
    const filter = { topic: topicId };
    if (matchStatus && ['match', 'extra', 'missing'].includes(matchStatus)) {
      filter.matchStatus = matchStatus;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    const resources = await Resource.find(filter).sort({ matchStatus: 1, createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('topic');
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createResource = async (req, res) => {
  try {
    const { topic, title, url, source, thumbnail, durationMinutes, matchStatus, covers, missing, notes } = req.body;
    if (!topic || !title || !url || !matchStatus) {
      return res.status(400).json({ message: 'topic, title, url, and matchStatus are required' });
    }
    const resource = await Resource.create({
      topic, title, url, source, thumbnail, durationMinutes, matchStatus,
      covers: covers || [], missing: missing || [], notes,
      addedBy: req.user._id,
    });
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getResourcesByTopic, getResourceById, createResource, updateResource, deleteResource };