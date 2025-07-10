const Doctor = require('../models/Doctor');

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addDoctor = async (req, res) => {
  try {
    const { name, specialization, bio, availableSlots } = req.body;
    const doctor = new Doctor({ name, specialization, bio, availableSlots });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 