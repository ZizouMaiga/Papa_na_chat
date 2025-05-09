const express = require('express');
const router = express.Router();
const { 
  createExam, 
  getExams, 
  getExamById, 
  addQuestion, 
  publishExam 
} = require('../controllers/examController');

// Routes pour les examens
router.post('/', createExam);
router.get('/', getExams);
router.get('/:id', getExamById);
router.post('/:examId/questions', addQuestion);
router.put('/:id/publish', publishExam);

// Nouvelle route pour les résultats par titre
router.get('/results', require('../controllers/examController').getExamResultsByTitle);

module.exports = router;