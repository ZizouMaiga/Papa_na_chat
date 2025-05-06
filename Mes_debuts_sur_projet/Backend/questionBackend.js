// Mes_debuts_sur_projet/Backend/questionBackend.js
const express = require('express');
const router = express.Router();
const db = require('../database');

// Route POST pour ajouter une question
router.post('/add-question', (req, res) => {
  const {
    examId,
    type,
    statement,
    media,
    points,
    duration,
    directAnswer,
    tolerance,
    options
  } = req.body;

  const optionsString = options ? JSON.stringify(options) : null;

  const sql = `
    INSERT INTO questions (exam_id, type, statement, media, points, duration, directAnswer, tolerance, options)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [examId, type, statement, media, points, duration, directAnswer, tolerance, optionsString], function (err) {
    if (err) {
      console.error("❌ Erreur lors de l'ajout de la question :", err.message);
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }
    res.json({ success: true, message: "Question ajoutée avec succès", questionId: this.lastID });
  });
});

module.exports = router;
