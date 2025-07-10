const mongoose = require('mongoose');

const medicalInfoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: String,
  age: Number,
  gender: String,
  bloodGroup: String,
  chronicConditions: String,
  medications: String,
  allergies: String,
  surgeries: String,
  familyHistory: String,
  lifestyle: String,
  emergencyContact: String,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('MedicalInfo', medicalInfoSchema); 