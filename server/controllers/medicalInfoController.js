const MedicalInfo = require('../models/MedicalInfo');

exports.getMedicalInfo = async (req, res) => {
  try {
    const info = await MedicalInfo.findOne({ user: req.user._id });
    res.json(info);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveMedicalInfo = async (req, res) => {
  try {
    const data = { ...req.body, user: req.user._id };
    let info = await MedicalInfo.findOne({ user: req.user._id });
    if (info) {
      info = await MedicalInfo.findOneAndUpdate({ user: req.user._id }, data, { new: true });
    } else {
      info = await MedicalInfo.create(data);
    }
    res.json(info);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 