const Topic = require('../models/Topic');
const Course = require('../models/Course');

const getTopicsByCourse = async (req, res) => {
  try {
    const { courseSlug } = req.query;
    if (!courseSlug) {
      return res.status(400).json({ message: 'courseSlug query parameter is required' });
    }
    const course = await Course.findOne({ slug: courseSlug.toLowerCase() });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const topics = await Topic.find({ course: course._id }).sort({ name: 1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createTopic = async (req, res) => {
  try {
    const { courseId, name, slug, description } = req.body;
    if (!courseId || !name || !slug) {
      return res.status(400).json({ message: 'courseId, name, and slug are required' });
    }
    const topic = await Topic.create({ course: courseId, name, slug: slug.toLowerCase(), description });
    res.status(201).json(topic);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This topic already exists for the selected course' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTopicsByCourse, createTopic };