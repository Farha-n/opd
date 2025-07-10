const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const userId = req.user._id;
    // Mark slot as booked
    await Doctor.updateOne(
      { _id: doctorId, 'availableSlots.date': date, 'availableSlots.time': time },
      { $set: { 'availableSlots.$.isBooked': true } }
    );
    // Create appointment
    const appointment = new Appointment({ user: userId, doctor: doctorId, date, time });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointments = await Appointment.find({ user: userId }).populate('doctor');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOne({ _id: appointmentId, user: userId });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    // Set status to canceled (add status if not present)
    appointment.status = 'canceled';
    await appointment.save();
    // Free the doctor's slot (robust version)
    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor) {
      const slot = doctor.availableSlots.find(
        s => s.date === appointment.date && s.time === appointment.time
      );
      if (slot) slot.isBooked = false;
      await doctor.save();
    }
    res.json({ message: 'Appointment canceled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 