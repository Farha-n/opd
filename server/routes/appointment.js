const express = require('express');
const router = express.Router();
const { bookAppointment, getUserAppointments, cancelAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/book', protect, bookAppointment);
router.get('/my', protect, getUserAppointments);
router.delete('/cancel/:id', protect, cancelAppointment);

module.exports = router; 