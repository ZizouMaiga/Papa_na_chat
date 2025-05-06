const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const db = require('./database');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../espace_etudiant')));

app.use(session({
  secret: 'exam-secret',
  resave: false,
  saveUninitialized: true
}));

// Accueil
app.get('/', (req, res) => {
  res.send("Bienvenue sur le serveur de la plateforme d'examen 📝");
});

// Inscription
app.post('/inscription', (req, res) => {
  const { type, email, nom, prenom, dateNaissance, sexe, etablissement, filiere, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    if (user) return res.status(400).json({ error: "Email déjà utilisé." });

    db.run(`
      INSERT INTO users (type, email, nom, prenom, dateNaissance, sexe, etablissement, filiere, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, email, nom, prenom, dateNaissance, sexe, etablissement, filiere, password],
      function (err) {
        if (err) return res.status(500).json({ error: "Erreur DB." });
        res.status(200).json({ message: "Inscription réussie !" });
      });
  });
});

// Connexion
app.post('/connexion', (req, res) => {
  const { email, password, type } = req.body;

  db.get(`SELECT * FROM users WHERE email = ? AND password = ? AND type = ?`,
    [email, password, type],
    (err, user) => {
      if (err) return res.status(500).json({ error: "Erreur serveur." });
      if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect." });

      req.session.user = user;
      res.status(200).json({ message: "Connexion réussie", utilisateur: user });
    });
});

// Ajouter un examen avec code et questions
app.post('/api/exams', async (req, res) => {
  const { id, title, description, target, questions } = req.body;
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    await db.run(`INSERT INTO exams (id, code, title, description, target) VALUES (?, ?, ?, ?, ?)`,
      [id, code, title, description, target]);

    for (const q of questions) {
      await db.run(
        `INSERT INTO questions (examId, type, statement, points, duration, directAnswer, tolerance, options)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, q.type, q.statement, q.points, q.duration,
          q.directAnswer || null, q.tolerance || null,
          q.options ? JSON.stringify(q.options) : null
        ]
      );
    }

    res.status(200).json({ message: "Examen publié avec succès", code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de l'enregistrement" });
  }
});

// Ajouter une question indépendamment
app.post('/api/questions/add-question', (req, res) => {
  const q = req.body;
  db.run(`
    INSERT INTO questions (examId, type, statement, media, points, duration, directAnswer, tolerance, options)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      q.examId, q.type, q.statement, q.media, q.points, q.duration,
      q.directAnswer || null, q.tolerance || null,
      q.options ? JSON.stringify(q.options) : null
    ],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: "Erreur SQL" });
      res.json({ success: true, questionId: this.lastID });
    });
});

// ✅ Récupérer un examen via son code (pour étudiant)
app.get('/api/exams/link/:code', (req, res) => {
  const code = req.params.code;
  db.get(`SELECT * FROM exams WHERE code = ?`, [code], (err, exam) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    if (!exam) return res.status(404).json({ error: "Examen introuvable" });

    db.all(`SELECT * FROM questions WHERE examId = ?`, [exam.id], (err, questions) => {
      if (err) return res.status(500).json({ error: "Erreur lors de la récupération des questions" });
      res.json({
        exam,
        questions: questions.map(q => ({
          ...q,
          options: q.options ? JSON.parse(q.options) : []
        }))
      });
    });
  });
});

// Obtenir toutes les questions d’un examen
app.get('/api/questions', (req, res) => {
  const { examId } = req.query;
  if (!examId) return res.status(400).json({ error: "ID examen requis" });

  db.all(`SELECT * FROM questions WHERE examId = ?`, [examId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json(rows.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : []
    })));
  });
});

// Enregistrement des résultats
app.post('/api/results', (req, res) => {
  const { examId, studentName, studentEmail, location, score, answers } = req.body;

  db.run(`
    INSERT INTO results (examId, studentName, studentEmail, latitude, longitude, score, answers)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [examId, studentName, studentEmail, location?.lat, location?.lon, score, JSON.stringify(answers)],
    function (err) {
      if (err) return res.status(500).json({ error: "Erreur DB." });
      res.status(201).json({ message: "Résultat enregistré." });
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
