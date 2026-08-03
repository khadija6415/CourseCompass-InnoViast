const Bookmark = require('../models/Bookmark');

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

module.exports = { getMyBookmarks, addBookmark, removeBookmark };