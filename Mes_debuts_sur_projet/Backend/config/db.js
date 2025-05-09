const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbConfig = {
      host: 'localhost',
      port: 27017,
      dbName: 'examenDB'
    };

    const uri = `mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`;
    console.log('🔄 Tentative de connexion à MongoDB...');
    console.log('📡 URI:', uri);
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Augmenter le timeout
      retryWrites: true,
      w: 'majority'
    });

    console.log('=================================');
    console.log('✅ Connexion MongoDB établie !');
    console.log(`📍 Serveur: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`📁 Base de données: ${conn.connection.name}`);
    console.log('=================================');

    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Déconnexion de MongoDB');
      // Tentative de reconnexion
      setTimeout(() => {
        console.log('🔄 Tentative de reconnexion...');
        connectDB();
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Reconnexion à MongoDB réussie');
    });

    // Vérifier si la collection Exam existe
    const collections = await conn.connection.db.listCollections().toArray();
    const examCollectionExists = collections.some(col => col.name === 'exams');

    if (!examCollectionExists) {
      console.log('⚠️ Collection Exam non trouvée, création d\'un examen de test...');
      const Exam = require('../models/Exam');
      
      // Créer un nouvel examen de test
      const testExam = new Exam({
        title: "Examen de test",
        description: "Ceci est un examen de test automatique",
        target: "Test",
        status: 'published',
        createdBy: new mongoose.Types.ObjectId(),
        questions: [{
          type: 'qcm',
          statement: "Question de test",
          points: 1,
          duration: 60,
          options: [
            { text: "Option 1", correct: true },
            { text: "Option 2", correct: false }
          ]
        }]
      });

      await testExam.save();
      console.log('✅ Examen de test créé avec succès !');
      console.log('📝 ID de l\'examen de test:', testExam._id);
    }

    return conn;
  } catch (err) {
    console.error('❌ Erreur de connexion à MongoDB:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      console.error('⚠️ Assurez-vous que MongoDB est installé et en cours d\'exécution sur votre machine');
    }
    throw err;
  }
};

module.exports = connectDB;