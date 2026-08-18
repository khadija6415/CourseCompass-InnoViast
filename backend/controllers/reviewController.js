const Review = require('../models/Review');

const addOrUpdateReview = async (req, res) => {
  try {
    const { resourceId, rating, comment } = req.body;
    if (!resourceId || !rating) {
      return res.status(400).json({ message: 'resourceId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }
    const review = await Review.findOneAndUpdate(
      { user: req.user._id, resource: resourceId },
      { rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getReviewsForResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const reviews = await Review.find({ resource: resourceId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    const count = reviews.length;
    const averageRating = count > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0;
    res.json({ reviews, averageRating, count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyReviewForResource = async (req, res) => {
  try {
    const review = await Review.findOne({ user: req.user._id, resource: req.params.resourceId });
    res.json(review); // null agar koi review nahi
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addOrUpdateReview, getReviewsForResource, getMyReviewForResource, deleteReview };