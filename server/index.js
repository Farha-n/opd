const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const appointmentRoutes = require('./routes/appointment');
const medicalInfoRoutes = require('./routes/medicalInfo');
const doctorDashboardRoutes = require('./routes/doctorDashboard');
const messageRoutes = require('./routes/message');
const userRoutes = require('./routes/user');
const aiChatRoutes = require('./routes/aiChat');
const tokenRoutes = require('./routes/token');
const slotRoutes = require('./routes/slots');

// Legacy routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-info', medicalInfoRoutes);
app.use('/api/doctor-dashboard', doctorDashboardRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai-chat', aiChatRoutes);

// OPD Token Allocation Engine Routes (API v1)
app.use('/api/v1/tokens', tokenRoutes);
app.use('/api/v1/slots', slotRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 