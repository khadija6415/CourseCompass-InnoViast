const express = require('express');
const router = express.Router();
const { getQuizForResource, submitQuiz, getMyAttempts, getMyAttemptsForResource } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/attempts/me', protect, getMyAttempts);
router.get('/attempts/resource/:resourceId', protect, getMyAttemptsForResource);
router.get('/:resourceId', protect, getQuizForResource);
router.post('/:resourceId/submit', protect, submitQuiz);

module.exports = router;