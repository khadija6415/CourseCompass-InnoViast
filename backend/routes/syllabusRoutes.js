const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { matchSyllabus } = require('../controllers/syllabusController');

router.post('/match', upload.single('syllabusFile'), matchSyllabus);

module.exports = router;