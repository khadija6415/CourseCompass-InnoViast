const Question = require('../models/Question');

const createQuestion = async (req, res) => {
  try {
    const { topic, questionText, options, correctAnswerIndex, tags } = req.body;
    if (!topic || !questionText || !options || correctAnswerIndex === undefined) {
      return res.status(400).json({ message: 'topic, questionText, options, and correctAnswerIndex are required' });
    }
    if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      return res.status(400).json({ message: 'correctAnswerIndex must be a valid index into options' });
    }
    const question = await Question.create({
      topic, questionText, options, correctAnswerIndex,
      tags: tags || [],
      createdBy: req.user._id,
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getQuestionsByTopic = async (req, res) => {
  try {
    const questions = await Question.find({ topic: req.params.topicId }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createQuestion, getQuestionsByTopic, updateQuestion, deleteQuestion };