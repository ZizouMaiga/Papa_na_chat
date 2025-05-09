const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['qcm', 'direct'],
    required: true
  },
  statement: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  media: String,
  // Pour les questions directes
  directAnswer: String,
  tolerance: Number,
  // Pour les QCM
  options: [{
    text: String,
    correct: Boolean
  }]
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  target: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  shareableLink: String,
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  results: [
    {
      nom: String,
      prenom: String,
      classe: String,
      note: Number,
      copieUrl: String
    }
  ]
});

module.exports = mongoose.model('Exam', examSchema);