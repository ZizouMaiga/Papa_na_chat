const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { 
    type: String, 
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['etudiant', ' enseignant'],
    required: true 
   
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);