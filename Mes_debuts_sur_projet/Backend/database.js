// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error("❌ Erreur lors de l'ouverture de la base de données :", err.message);
  } else {
    console.log("✅ Connecté à la base de données SQLite.");
  }
});
// Création de la table si elle n'existe pas
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    email TEXT NOT NULL,
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
    console.error("❌ Erreur lors de la création de la table :", err.message);
  } else {
    console.log("✅ Table 'users' prête.");
  }
});

module.exports = db;