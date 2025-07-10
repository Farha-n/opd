const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  availableSlots: [
    {
      date: String, // e.g. '2024-07-10'
      time: String, // e.g. '10:00 AM'
      isBooked: { type: Boolean, default: false },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema); 