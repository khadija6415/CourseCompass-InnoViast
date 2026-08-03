const pdfParse = require('pdf-parse');
const Resource = require('../models/Resource');

const STOPWORDS = new Set([
  'the', 'and', 'of', 'to', 'a', 'in', 'is', 'for', 'on', 'with', 'as', 'by',
  'an', 'at', 'or', 'be', 'this', 'that', 'are', 'it', 'from', 'will', 'can',
  'have', 'has', 'not', 'but', 'their', 'which', 'you', 'your', 'course', 'unit',
]);

function extractKeywords(text) {
  return [...new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  )];
}

function phraseMatchesKeywords(phrase, keywordSet) {
  const words = phrase.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const matchedCount = words.filter((w) => keywordSet.has(w)).length;
  return matchedCount / words.length >= 0.5;
}

const matchSyllabus = async (req, res) => {
  try {
    const { topicId, syllabusText } = req.body;
    if (!topicId) {
      return res.status(400).json({ message: 'topicId is required' });
    }

    let text = syllabusText || '';

    if (req.file) {
      const parsed = await pdfParse(req.file.buffer);
      text = parsed.text;
    }

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ message: 'Please paste syllabus text or upload a PDF with readable text.' });
    }

    const keywords = extractKeywords(text);
    const keywordSet = new Set(keywords);

    const resources = await Resource.find({ topic: topicId });

    const results = resources.map((r) => {
      const covers = r.covers || [];
      const matchedCovers = covers.filter((c) => phraseMatchesKeywords(c, keywordSet));
      const personalizedMatchPercent = covers.length > 0
        ? Math.round((matchedCovers.length / covers.length) * 100)
        : null;

      return {
        _id: r._id,
        personalizedMatchPercent,
        matchedCovers,
      };
    });

    res.json({ keywordCount: keywords.length, resources: results });
  } catch (error) {
    console.error('Syllabus match error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { matchSyllabus };