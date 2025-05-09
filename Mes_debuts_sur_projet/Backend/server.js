const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const examRoutes = require("./routes/examRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// === Chemins statiques corrigés ===
// Le dossier Frontend (accueil.html, CSS, etc.)
app.use(express.static(path.join(__dirname, '../Frontend')));

// Les espaces étudiants et enseignants
app.use('/espace_etudiant', express.static(path.join(__dirname, '../espace_etudiant')));
app.use('/espace_enseignat', express.static(path.join(__dirname, '../espace_enseignat')));

// Routes API
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);

// Route d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/accueil.html'));
});

// Connexion à la base de données et démarrage du serveur
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      console.log("=================================");
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📝 Test API: http://localhost:${PORT}/test`);
      console.log("📚 API Documentation:");
      console.log("   - GET    /api/exams         : Liste des examens");
      console.log("   - POST   /api/exams         : Créer un examen");
      console.log("   - GET    /api/exams/:id     : Détails d'un examen");
      console.log("   - POST   /api/exams/:id/questions : Ajouter une question");
      console.log("   - PUT    /api/exams/:id/publish  : Publier un examen");
      console.log("=================================");
    });
  })
  .catch(err => {
    console.error("❌ Erreur de démarrage:", err);
    process.exit(1);
  });
