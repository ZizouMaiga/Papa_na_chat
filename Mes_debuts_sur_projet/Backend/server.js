const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

// 🔹 Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../Frontend')));

app.use(session({
  secret: 'exam-secret',
  resave: false,
  saveUninitialized: true
}));

// 🔹 Page d’accueil
app.get('/', (req, res) => {
  res.send("Bienvenue sur le serveur de la plateforme d'examen 📝");
});

// 🔹 Inscription
app.post('/inscription', (req, res) => {
  const {
    type, email, nom, prenom,
    dateNaissance, sexe, etablissement, filiere, password
  } = req.body;

  const checkQuery = `SELECT * FROM users WHERE email = ?`;
  db.get(checkQuery, [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    if (user) return res.status(400).json({ error: "Email déjà utilisé." });

    const insertQuery = `
      INSERT INTO users (type, email, nom, prenom, dateNaissance, sexe, etablissement, filiere, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [type, email, nom, prenom, dateNaissance, sexe, etablissement, filiere, password];
    db.run(insertQuery, params, function (err) {
      if (err) return res.status(500).json({ error: "Erreur DB." });
      res.status(200).json({ message: "Inscription réussie !" });
    });
  });
});

// 🔹 Connexion
app.post('/connexion', (req, res) => {
  const { email, password, type } = req.body;

  const query = `SELECT * FROM users WHERE email = ? AND password = ? AND type = ?`;
  const params = [email, password, type];

  db.get(query, params, (err, user) => {
    if (err) return res.status(500).json({ error: "Erreur serveur." });
    if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect." });

    req.session.user = user;
    res.status(200).json({ message: "Connexion réussie", utilisateur: user });
  });
});

// 🔹 Ajout d’un examen
app.post('/api/examens', (req, res) => {
  const { title, description, target } = req.body;

  if (!title || !description || !target) {
    return res.status(400).json({ error: "Champs manquants." });
  }

  const query = `
    INSERT INTO exams (title, description, target)
    VALUES (?, ?, ?)
  `;
  const params = [title, description, target];

  db.run(query, params, function (err) {
    if (err) return res.status(500).json({ error: "Erreur DB." });
    res.status(201).json({ message: "Examen ajouté avec succès", id: this.lastID });
  });
});

// 🔹 Ajout d’une question
app.post('/api/questions/add-question', (req, res) => {
  const q = req.body;

  const sql = `
    INSERT INTO questions (examId, type, statement, media, points, duration, directAnswer, tolerance, options)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    q.examId,
    q.type,
    q.statement,
    q.media,
    q.points,
    q.duration,
    q.directAnswer || null,
    q.tolerance || null,
    q.options ? JSON.stringify(q.options) : null
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ success: false, message: "Erreur SQL" });
    res.json({ success: true, questionId: this.lastID });
  });
});

// 🔹 Lancement du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
