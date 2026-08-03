const Course = require('../models/Course');

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ name: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }
    const course = await Course.create({ name, slug: slug.toLowerCase(), description });
    res.status(201).json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A course with this name or slug already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getCourses, createCourse };