const User = require('../models/User');
const Course = require('../models/Course');
const Topic = require('../models/Topic');
const Resource = require('../models/Resource');
const Bookmark = require('../models/Bookmark');
const Review = require('../models/Review');
const QuizAttempt = require('../models/QuizAttempt');

const getOverview = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalAdmins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
    ]);
    const [totalCourses, totalTopics, totalResources] = await Promise.all([
      Course.countDocuments(),
      Topic.countDocuments(),
      Resource.countDocuments(),
    ]);
    const matchStatusBreakdown = await Resource.aggregate([
      { $group: { _id: '$matchStatus', count: { $sum: 1 } } },
    ]);
    const [totalBookmarks, totalCompleted] = await Promise.all([
      Bookmark.countDocuments(),
      Bookmark.countDocuments({ status: 'completed' }),
    ]);
    const [totalReviews, reviewStats] = await Promise.all([
      Review.countDocuments(),
      Review.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' } } }]),
    ]);
    const [totalQuizAttempts, quizStats] = await Promise.all([
      QuizAttempt.countDocuments(),
      QuizAttempt.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$score' }, avgTotal: { $avg: '$totalQuestions' } } },
      ]),
    ]);

    const avgRating = reviewStats[0] ? Math.round(reviewStats[0].avgRating * 10) / 10 : 0;
    const avgQuizPercentage = quizStats[0] && quizStats[0].avgTotal > 0
      ? Math.round((quizStats[0].avgScore / quizStats[0].avgTotal) * 100)
      : 0;

    res.json({
      totalUsers, totalStudents, totalAdmins,
      totalCourses, totalTopics, totalResources,
      matchStatusBreakdown,
      totalBookmarks, totalCompleted,
      completionRate: totalBookmarks > 0 ? Math.round((totalCompleted / totalBookmarks) * 100) : 0,
      totalReviews, avgRating,
      totalQuizAttempts, avgQuizPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPopularResources = async (req, res) => {
  try {
    const popular = await Bookmark.aggregate([
      {
        $group: {
          _id: '$resource',
          bookmarkCount: { $sum: 1 },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { bookmarkCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'resources', localField: '_id', foreignField: '_id', as: 'resource' } },
      { $unwind: '$resource' },
      { $lookup: { from: 'reviews', localField: '_id', foreignField: 'resource', as: 'reviews' } },
      {
        $addFields: {
          averageRating: {
            $cond: [{ $gt: [{ $size: '$reviews' }, 0] }, { $round: [{ $avg: '$reviews.rating' }, 1] }, 0],
          },
          reviewCount: { $size: '$reviews' },
        },
      },
      {
        $project: {
          _id: 0,
          resourceId: '$resource._id',
          title: '$resource.title',
          matchStatus: '$resource.matchStatus',
          bookmarkCount: 1,
          completedCount: 1,
          averageRating: 1,
          reviewCount: 1,
        },
      },
    ]);
    res.json(popular);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTopicPerformance = async (req, res) => {
  try {
    const topics = await Topic.find().populate('course', 'name');
    const results = await Promise.all(topics.map(async (topic) => {
      const resourceIds = await Resource.find({ topic: topic._id }).distinct('_id');
      const totalResources = resourceIds.length;
      const completedCount = await Bookmark.countDocuments({ status: 'completed', resource: { $in: resourceIds } });
      const attempts = await QuizAttempt.find({ topic: topic._id });
      const avgQuizPercentage = attempts.length > 0
        ? Math.round((attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions), 0) / attempts.length) * 100)
        : null;
      const reviews = await Review.find({ resource: { $in: resourceIds } });
      const avgRating = reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : null;
      return {
        topicId: topic._id,
        topicName: topic.name,
        courseName: topic.course ? topic.course.name : null,
        totalResources,
        completedCount,
        avgQuizPercentage,
        avgRating,
      };
    }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEngagementTrend = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 14);

    const completionsTrend = await Bookmark.aggregate([
      { $match: { status: 'completed', completedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const quizTrend = await QuizAttempt.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ completionsTrend, quizTrend });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getOverview, getPopularResources, getTopicPerformance, getEngagementTrend };