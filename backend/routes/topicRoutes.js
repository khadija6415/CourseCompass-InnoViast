const express = require('express');
const router = express.Router();
const { getTopicsByCourse, createTopic } = require('../controllers/topicController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getTopicsByCourse);
router.post('/', protect, adminOnly, createTopic);

module.exports = router;