const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('../models/Doctor');

dotenv.config({ path: __dirname + '/../.env' });

const cleanupDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const result = await Doctor.deleteMany();
    console.log(`Deleted ${result.deletedCount} doctors.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanupDoctors(); 