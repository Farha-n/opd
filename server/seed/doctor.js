const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

dotenv.config({ path: __dirname + '/../.env' });

const doctors = [
  {
    name: 'Dr. Alice Smith',
    email: 'alice@opd.com',
    password: 'doctor123',
    specialization: 'General Physician',
    bio: 'Experienced general physician with 10+ years in OPD.',
    availableSlots: [
      { date: '2024-07-10', time: '10:00 AM' },
      { date: '2024-07-10', time: '11:00 AM' },
    ],
  },
  {
    name: 'Dr. Bob Johnson',
    email: 'bob@opd.com',
    password: 'doctor123',
    specialization: 'Pediatrician',
    bio: 'Caring pediatrician for children of all ages.',
    availableSlots: [
      { date: '2024-07-11', time: '09:00 AM' },
      { date: '2024-07-11', time: '10:30 AM' },
    ],
  },
  {
    name: 'Dr. Carol Lee',
    email: 'carol@opd.com',
    password: 'doctor123',
    specialization: 'Dermatologist',
    bio: 'Expert in skin care and dermatology.',
    availableSlots: [
      { date: '2024-07-12', time: '02:00 PM' },
      { date: '2024-07-12', time: '03:00 PM' },
    ],
  },
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    for (const doc of doctors) {
      await User.deleteOne({ email: doc.email });
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: doc.password,
        role: 'doctor',
      });
      await Doctor.deleteOne({ user: user._id });
      await Doctor.create({
        name: doc.name,
        email: doc.email,
        specialization: doc.specialization,
        bio: doc.bio,
        availableSlots: doc.availableSlots,
        user: user._id,
      });
    }
    console.log('Seeded doctors:');
    doctors.forEach(doc => {
      console.log(`Email: ${doc.email} | Password: ${doc.password}`);
    });
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDoctors(); 