const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// OPD Token Allocation Engine Routes
const tokenRoutes = require('./routes/token');
const slotRoutes = require('./routes/slots');

app.use('/api/v1/tokens', tokenRoutes);
app.use('/api/v1/slots', slotRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'OPD Token Allocation Engine API',
    version: '1.0.0',
    endpoints: {
      tokens: '/api/v1/tokens',
      slots: '/api/v1/slots'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
