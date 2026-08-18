const express = require('express');
const router = express.Router();
const { addOrUpdateReview, getReviewsForResource, getMyReviewForResource, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addOrUpdateReview);
router.get('/resource/:resourceId', getReviewsForResource);
router.get('/resource/:resourceId/mine', protect, getMyReviewForResource);
router.delete('/:id', protect, deleteReview);

module.exports = router;