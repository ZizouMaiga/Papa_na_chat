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
app.use(express.static(path.join(__dirname, '../Frontend')));

app.use(session({
  secret: 'exam-secret',
  resave: false,
  saveUninitialized: true
}));

// Accueil
app.get('/', (req, res) => {
  res.send('Bienvenue sur le serveur de la plateforme d\'examen 📝');
});

// 🔹 Inscription
app.post('/inscription', (req, res) => {
  const {
    type,
    email,
    nom,
    prenom,
    dateNaissance,
    sexe,
    etablissement,
    filiere,
    password
  } = req.body;
  console.log("✅ Données reçues pour inscription :", req.body);

  const checkQuery = `SELECT * FROM users WHERE email = ?`;
  db.get(checkQuery, [email], (err, user) => {
    if (err) {
      console.error("Erreur lors de la vérification :", err.message);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (user) {
      return res.status(400).json({ error: "Un compte avec cet email existe déjà." });
    }

    const insertQuery = `
      INSERT INTO users (type, email, nom, prenom, dateNaissance, sexe, etablissement, filiere, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [type, email, nom, prenom, dateNaissance, sexe, etablissement, filiere, password];

    db.run(insertQuery, params, function (err) {
      if (err) {
        console.error("Erreur DB :", err.message);
        return res.status(500).json({ error: "Erreur lors de l'inscription." });
      }
      res.status(200).json({ message: "Inscription réussie !" });
    });
  });
});

// 🔹 Connexion
app.post('/connexion', (req, res) => {
  const { email, password, type } = req.body;

  const query = `SELECT * FROM users WHERE email = ? AND password = ? AND type = ?`;
  const params = [email, password, type];

  db.get(query, params, (err, row) => {
    if (err) {
      console.error("Erreur DB :", err.message);
      return res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
    if (row) {
      req.session.user = row;
      return res.status(200).json({ message: "Connexion réussie", utilisateur: row });
    } else {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }
  });
});

// Lancement serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur en cours sur http://localhost:${PORT}`);
});

