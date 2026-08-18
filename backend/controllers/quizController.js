const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Resource = require('../models/Resource');

const QUIZ_LENGTH = 5;

const getQuizForResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    const allQuestions = await Question.find({ topic: resource.topic }).select('-correctAnswerIndex');
    if (allQuestions.length === 0) {
      return res.status(404).json({ message: 'No quiz available for this topic yet' });
    }
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    res.json({
      resourceId: resource._id,
      topicId: resource.topic,
      questions: shuffled.slice(0, QUIZ_LENGTH),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionId, selectedIndex }]
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'answers array is required' });
    }
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    let score = 0;
    const gradedAnswers = answers.map((a) => {
      const question = questions.find((q) => q._id.toString() === a.questionId);
      const isCorrect = question ? question.correctAnswerIndex === a.selectedIndex : false;
      if (isCorrect) score += 1;
      return { question: a.questionId, selectedIndex: a.selectedIndex, isCorrect };
    });

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      resource: resource._id,
      topic: resource.topic,
      score,
      totalQuestions: answers.length,
      answers: gradedAnswers,
    });

    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .populate({ path: 'resource', select: 'title topic' })
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyAttemptsForResource = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id, resource: req.params.resourceId }).sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getQuizForResource, submitQuiz, getMyAttempts, getMyAttemptsForResource };