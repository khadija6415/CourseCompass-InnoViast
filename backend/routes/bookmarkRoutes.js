const express = require('express');
const router = express.Router();
const { getMyBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyBookmarks);
router.post('/', protect, addBookmark);
router.delete('/:resourceId', protect, removeBookmark);

module.exports = router;