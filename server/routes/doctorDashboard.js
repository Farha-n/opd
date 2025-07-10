const express = require('express');
const router = express.Router();
const { getDoctorDashboard } = require('../controllers/doctorDashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDoctorDashboard);

module.exports = router; 