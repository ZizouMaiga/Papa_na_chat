// ✅ database.js corrigé
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error("❌ Erreur lors de l'ouverture de la base de données :", err.message);
  } else {
    console.log("✅ Connecté à la base de données SQLite.");
  }
});

function handleError(table) {
  return function (err) {
    if (err) {
      console.error(`❌ Erreur lors de la création de la table ${table} :`, err.message);
    } else {
      console.log(`✅ Table '${table}' prête.`);
    }
  };
}

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
`, handleError('users'));

// 🔹 Table des examens
db.run(`
  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, handleError('exams'));

// 🔹 Table des questions
db.run(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    examId INTEGER NOT NULL,
    type TEXT NOT NULL,
    statement TEXT NOT NULL,
    media TEXT,
    points INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    directAnswer TEXT,
    tolerance INTEGER,
    options TEXT,
    FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE
  )
`, handleError('questions'));

// 🔹 Table des résultats (corrigée avec answers)
db.run(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    examId INTEGER,
    studentName TEXT,
    studentEmail TEXT,
    latitude REAL,
    longitude REAL,
    score INTEGER,
    answers TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (examId) REFERENCES exams(id)
  )
`, handleError('results'));

module.exports = db;

