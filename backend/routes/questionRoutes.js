const express = require('express');
const router = express.Router();
const { createQuestion, getQuestionsByTopic, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, createQuestion);
router.get('/topic/:topicId', protect, adminOnly, getQuestionsByTopic);
router.put('/:id', protect, adminOnly, updateQuestion);
router.delete('/:id', protect, adminOnly, deleteQuestion);

module.exports = router;