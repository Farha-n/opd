const express = require('express');
const router = express.Router();
const { getDoctors, addDoctor } = require('../controllers/doctorController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.post('/', protect, addDoctor); // Only admin can add doctors

module.exports = router; 