const Bookmark = require('../models/Bookmark');
const Resource = require('../models/Resource');

const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate({
      path: 'resource',
      populate: { path: 'topic' },
    });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addBookmark = async (req, res) => {
  try {
    const { resourceId } = req.body;
    if (!resourceId) {
      return res.status(400).json({ message: 'resourceId is required' });
    }
    const existing = await Bookmark.findOne({ user: req.user._id, resource: resourceId });
    if (existing) {
      return res.status(400).json({ message: 'Resource already bookmarked' });
    }
    const bookmark = await Bookmark.create({ user: req.user._id, resource: resourceId });
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({ user: req.user._id, resource: req.params.resourceId });
    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['saved', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    let bookmark = await Bookmark.findOne({ user: req.user._id, resource: req.params.resourceId });
    if (!bookmark) {
      bookmark = new Bookmark({ user: req.user._id, resource: req.params.resourceId });
    }
    bookmark.status = status;
    bookmark.completedAt = status === 'completed' ? new Date() : undefined;
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTopicProgress = async (req, res) => {
  try {
    const { topicId } = req.params;
    const resourceIds = await Resource.find({ topic: topicId }).distinct('_id');
    const totalResources = resourceIds.length;
    const completedCount = await Bookmark.countDocuments({
      user: req.user._id,
      status: 'completed',
      resource: { $in: resourceIds },
    });
    res.json({
      topicId,
      totalResources,
      completed: completedCount,
      percentage: totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMyBookmarks, addBookmark, removeBookmark, updateStatus, getTopicProgress };