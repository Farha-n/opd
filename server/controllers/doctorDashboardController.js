const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const MedicalInfo = require('../models/MedicalInfo');

exports.getDoctorDashboard = async (req, res) => {
  try {
    // Find doctor profile by user id (linked by user field)
    const doctor = await Doctor.findOne({ user: req.user._id }) || {};
    // Find appointments for this doctor
    const appointments = await Appointment.find({ doctor: doctor._id, status: { $ne: 'canceled' } })
      .populate('user', 'name email')
      .lean();
    // Attach medical info for each patient
    for (let appt of appointments) {
      appt.medicalInfo = await MedicalInfo.findOne({ user: appt.user._id }) || null;
    }
    res.json({ doctor, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 