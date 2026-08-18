const express = require('express');
const router = express.Router();
const { getMyBookmarks, addBookmark, removeBookmark, updateStatus, getTopicProgress } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyBookmarks);
router.post('/', protect, addBookmark);
router.patch('/:resourceId/status', protect, updateStatus);
router.get('/progress/:topicId', protect, getTopicProgress);
router.delete('/:resourceId', protect, removeBookmark);

module.exports = router;