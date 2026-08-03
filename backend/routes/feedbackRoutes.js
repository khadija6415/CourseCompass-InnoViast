const express = require('express');
const router = express.Router();
const { addFeedback, getFeedbackForResource } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addFeedback);
router.get('/:resourceId', getFeedbackForResource);

module.exports = router;