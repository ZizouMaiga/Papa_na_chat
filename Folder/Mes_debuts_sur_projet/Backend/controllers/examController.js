const Exam = require('../models/Exam');
const mongoose = require('mongoose');

// Créer un nouvel examen
exports.createExam = async (req, res) => {
  try {
    console.log('📝 Tentative de création d\'examen:', req.body);
    
    if (!req.body.title || !req.body.description || !req.body.target) {
      return res.status(400).json({
        success: false,
        message: 'Informations d\'examen incomplètes',
        details: 'Le titre, la description et le public cible sont requis'
      });
    }
    
    // Créer un ID temporaire pour l'enseignant
    const tempUserId = new mongoose.Types.ObjectId();
    
    const exam = new Exam({
      ...req.body,
      createdBy: tempUserId,
      status: 'published',
      questions: [], // Initialiser avec un tableau vide
      shareableLink: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/espace_etudiant/exam.html?id=`
    });
    
    await exam.save();
    
    // Mettre à jour le lien partageable avec l'ID
    exam.shareableLink += exam._id;
    await exam.save();
    
    console.log('✅ Examen créé avec succès, ID:', exam._id);
    console.log('🔗 Lien partageable:', exam.shareableLink);
    
    res.status(201).json({ 
      success: true, 
      exam,
      message: 'Examen créé avec succès',
      shareableLink: exam.shareableLink
    });
  } catch (error) {
    console.error('❌ Erreur création examen:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message,
      message: 'Erreur lors de la création de l\'examen'
    });
  }
};

// Récupérer tous les examens
exports.getExams = async (req, res) => {
  try {
    console.log('🔍 Recherche de tous les examens');
    const exams = await Exam.find()
      .select('title description target status questions shareableLink createdAt')
      .sort('-createdAt');
    
    console.log(`📊 ${exams.length} examens trouvés`);
    res.json({ 
      success: true, 
      exams,
      count: exams.length 
    });
  } catch (error) {
    console.error('❌ Erreur récupération examens:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Erreur lors de la récupération des examens'
    });
  }
};

// Récupérer un examen par son ID
exports.getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Recherche de l\'examen avec l\'ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'examen invalide',
        details: 'Le format de l\'ID n\'est pas valide'
      });
    }

    const exam = await Exam.findById(id);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Examen non trouvé',
        details: 'Aucun examen trouvé avec cet identifiant'
      });
    }

    if (!exam.questions || !Array.isArray(exam.questions)) {
      exam.questions = [];
      await exam.save();
    }

    console.log('✅ Examen trouvé:', {
      id: exam._id,
      title: exam.title,
      questionCount: exam.questions.length
    });

    res.json({ 
      success: true, 
      exam,
      questionCount: exam.questions.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Ajouter une question à un examen
exports.addQuestion = async (req, res) => {
  try {
    const { examId } = req.params;
    console.log('📝 Ajout d\'une question à l\'examen:', examId);
    
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'examen invalide'
      });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Examen non trouvé'
      });
    }

    // Validation de la structure de la question
    const { type, statement, points, duration } = req.body;
    if (!type || !statement || !points || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Données de question incomplètes',
        details: 'Type, énoncé, points et durée sont requis'
      });
    }

    // Validation spécifique selon le type de question
    if (type === 'qcm') {
      if (!req.body.options || !Array.isArray(req.body.options) || req.body.options.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Options QCM invalides',
          details: 'Les questions QCM doivent avoir des options valides'
        });
      }
      // Vérifier qu'au moins une option est correcte
      const hasCorrectOption = req.body.options.some(opt => opt.correct);
      if (!hasCorrectOption) {
        return res.status(400).json({
          success: false,
          message: 'Options QCM invalides',
          details: 'Au moins une option doit être correcte'
        });
      }
    } else if (type === 'direct') {
      if (!req.body.directAnswer) {
        return res.status(400).json({
          success: false,
          message: 'Réponse directe manquante',
          details: 'Les questions directes doivent avoir une réponse'
        });
      }
    }

    // S'assurer que questions est un tableau
    if (!exam.questions) {
      exam.questions = [];
    }

    // Ajout de la question
    exam.questions.push(req.body);
    await exam.save();
    
    console.log('✅ Question ajoutée avec succès');
    console.log('📊 Nombre total de questions:', exam.questions.length);
    
    res.json({ 
      success: true, 
      exam,
      message: 'Question ajoutée avec succès',
      questionCount: exam.questions.length 
    });
  } catch (error) {
    console.error('❌ Erreur ajout question:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message,
      message: 'Erreur lors de l\'ajout de la question' 
    });
  }
};

// Publier un examen
exports.publishExam = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📢 Publication de l\'examen:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID d\'examen invalide'
      });
    }

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Examen non trouvé'
      });
    }

    if (!exam.questions || exam.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'L\'examen ne peut pas être publié',
        details: 'L\'examen doit contenir au moins une question'
      });
    }

    exam.status = 'published';
    exam.shareableLink = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/espace_etudiant/exam.html?id=${exam._id}`;
    await exam.save();
    
    console.log('✅ Examen publié avec succès');
    console.log('🔗 Lien partageable:', exam.shareableLink);

    res.json({ 
      success: true, 
      exam,
      message: 'Examen publié avec succès',
      shareableLink: exam.shareableLink
    });
  } catch (error) {
    console.error('❌ Erreur publication examen:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Erreur lors de la publication de l\'examen'
    });
  }
};

// Récupérer les résultats d'un examen par titre
exports.getExamResultsByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ success: false, message: "Titre d'examen requis" });
    }
    const exam = await Exam.findOne({ title });
    if (!exam) {
      return res.status(404).json({ success: false, message: "Examen non trouvé" });
    }
    res.json({ success: true, results: exam.results || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};