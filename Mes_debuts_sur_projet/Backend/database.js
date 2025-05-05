// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error("❌ Erreur lors de l'ouverture de la base de données :", err.message);
  } else {
    console.log("✅ Connecté à la base de données SQLite.");
  }
});

// 🔹 Table des utilisateurs
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    dateNaissance TEXT NOT NULL,
    sexe TEXT NOT NULL,
    etablissement TEXT NOT NULL,
    filiere TEXT NOT NULL,
    password TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error("❌ Erreur création table users :", err.message);
  } else {
    console.log("✅ Table 'users' prête.");
  }
});

// 🔹 Table des examens
db.run(`
  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error("❌ Erreur création table exams :", err.message);
  } else {
    console.log("✅ Table 'exams' prête.");
  }
});

// 🔹 Table des questions
db.run(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    examId INTEGER,
    type TEXT,
    statement TEXT,
    media TEXT,
    points INTEGER,
    duration INTEGER,
    directAnswer TEXT,
    tolerance INTEGER,
    options TEXT,
    FOREIGN KEY (examId) REFERENCES exams(id)
  )
`, (err) => {
  if (err) {
    console.error("❌ Erreur création table questions :", err.message);
  } else {
    console.log("✅ Table 'questions' prête.");
  }
});

module.exports = db;
