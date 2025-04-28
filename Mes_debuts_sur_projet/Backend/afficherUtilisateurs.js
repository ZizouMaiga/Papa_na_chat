const db = require('./database');

db.all("SELECT * FROM users", [], (err, rows) => {
  if (err) {
    throw err;
  }
  console.log("Liste des utilisateurs inscrits :");
  rows.forEach((row) => {
    console.log(row);
  });
});