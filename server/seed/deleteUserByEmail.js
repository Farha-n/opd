const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: __dirname + '/../.env' });

const email = process.argv[2] || 'alice@opd.com';

const deleteUserByEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const result = await User.deleteOne({ email });
    console.log(`Deleted user with email ${email}:`, result);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

deleteUserByEmail(); 