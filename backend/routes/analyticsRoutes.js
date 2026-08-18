const express = require('express');
const router = express.Router();
const { getOverview, getPopularResources, getTopicPerformance, getEngagementTrend } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/overview', protect, adminOnly, getOverview);
router.get('/popular-resources', protect, adminOnly, getPopularResources);
router.get('/topic-performance', protect, adminOnly, getTopicPerformance);
router.get('/engagement-trend', protect, adminOnly, getEngagementTrend);

module.exports = router;