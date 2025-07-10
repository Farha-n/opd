const express = require('express');
const router = express.Router();
const { getMedicalInfo, saveMedicalInfo } = require('../controllers/medicalInfoController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMedicalInfo);
router.post('/', protect, saveMedicalInfo);

module.exports = router; 