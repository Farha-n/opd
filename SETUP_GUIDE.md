# 🚀 Setup & Configuration Guide

## Prerequisites

- **Node.js:** v14 or higher
- **MongoDB:** Local or Atlas cloud
- **npm:** v6 or higher
- **Git:** For version control (optional)

---

## Step-by-Step Setup

### 1. Navigate to Server Directory
```bash
cd f:\opd\server
```

### 2. Install Dependencies
```bash
npm install
```

Expected packages:
- express (API framework)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- cors (cross-origin requests)
- dotenv (environment variables)
- openai (for AI features)

### 3. Create Environment File

Create `.env` file in `server/` directory:
```bash
# Minimum Required
MONGO_URI=mongodb://localhost:27017/opd
PORT=5000
JWT_SECRET=your_secret_key_2024

# Optional
NODE_ENV=development
LOG_LEVEL=info
```

**For MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/opd?retryWrites=true&w=majority
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Get connection string
- Update MONGO_URI in .env

### 5. Verify Installation

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check if dependencies installed
npm list --depth=0
```

Expected output:
```
server@1.0.0
├── bcryptjs@3.0.2
├── cors@2.8.5
├── dotenv@17.1.0
├── express@5.1.0
├── jsonwebtoken@9.0.2
├── mongoose@8.16.2
└── openai@5.9.0
```

---

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

Expected output:
```
MongoDB connected
Server running on port 5000
✅ Ready for API requests
```

### Production Mode
```bash
npm start
```

---

## Running the Simulation

### Full Simulation
```bash
npm run simulate
```

**What it does:**
1. Creates 3 doctors with specializations
2. Creates 15 time slots
3. Creates 15 test patients
4. Allocates tokens with mixed priorities
5. Demonstrates cancellation and reallocation
6. Displays detailed statistics

**Expected runtime:** 3-5 seconds

**Output includes:**
```
✅ Connected to MongoDB
🧹 Cleaning up existing data...
👨‍⚕️ Creating doctors...
📅 Creating OPD slots...
👥 Creating test patients...
🎟️ SIMULATING TOKEN ALLOCATION...
📊 SIMULATION STATISTICS
✅ SIMULATION COMPLETED SUCCESSFULLY
```

---

## Testing the APIs

### Option 1: Using cURL

```bash
# Create a token
curl -X POST http://localhost:5000/api/v1/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "507f1f77bcf86cd799439011",
    "patientName": "Test Patient",
    "doctorId": "507f1f77bcf86cd799439012",
    "appointmentDate": "2024-12-28",
    "appointmentTime": "09:00 AM",
    "type": "online_booking"
  }'

# Get token details
curl http://localhost:5000/api/v1/tokens/TOKEN_ID_HERE
```

### Option 2: Using Postman

1. Open Postman
2. Click "New" → "HTTP Request"
3. Set method to `POST`
4. Enter URL: `http://localhost:5000/api/v1/tokens`
5. Click "Body" → "raw" → select "JSON"
6. Paste request body from API_REFERENCE.md
7. Click "Send"

### Option 3: Using Insomnia

Similar to Postman, create requests for each endpoint.

---

## Accessing MongoDB Data

### Using MongoDB Compass (GUI)
1. Download MongoDB Compass from mongodb.com
2. Connect to localhost:27017
3. Browse collections: Token, OPDSlot, User, Doctor

### Using MongoDB Shell
```bash
# Connect to local MongoDB
mongosh localhost:27017/opd

# View all tokens
db.tokens.find()

# View all slots
db.opdslots.find()

# View specific token
db.tokens.findOne({ tokenNumber: "TOKEN-2024-12-28-507f1f-001" })

# Count tokens
db.tokens.countDocuments()
```

### Using Node.js Script
```javascript
const mongoose = require('mongoose');
const Token = require('./models/Token');

mongoose.connect('mongodb://localhost:27017/opd');

Token.find().then(tokens => {
  console.log('Total tokens:', tokens.length);
  console.log(tokens);
});
```

---

## Troubleshooting

### Issue: "MongoDB connection error"
```
Solution:
1. Ensure MongoDB is running: mongod
2. Check MONGO_URI in .env
3. Verify connection string format
4. Check firewall settings
```

### Issue: "Port 5000 already in use"
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
# Update PORT in .env
```

### Issue: "Module not found: Cannot find module 'express'"
```bash
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

### Issue: "Validation error: Invalid ObjectId"
```
Solution:
- Ensure IDs are valid MongoDB ObjectIds (24 hex characters)
- From simulation, copy actual IDs from output
- Use them in subsequent API calls
```

### Issue: "Token not allocated, added to waitlist"
```
Solution:
- This is normal when slot is full (capacity 10)
- Wait for another token to complete
- Then waitlist tokens are automatically promoted
```

---

## Environment Variables Reference

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| MONGO_URI | Yes | - | mongodb://localhost:27017/opd |
| PORT | No | 5000 | 5000 |
| JWT_SECRET | No | dev_secret | your_secret_key |
| NODE_ENV | No | development | development \| production |

---

## npm Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server (auto-reload)
npm run simulate   # Run OPD simulation
npm run seed       # Seed doctors (if script exists)
npm test           # Run tests (when configured)
```

---

## Project Structure Quick Reference

```
server/
├── .env                    # Environment variables (CREATE THIS)
├── index.js               # Server entry point
├── package.json           # Dependencies & scripts
├── models/
│   ├── Token.js          # Token allocation model
│   └── OPDSlot.js        # Slot capacity model
├── controllers/
│   ├── tokenController.js
│   └── opdSlotController.js
├── services/
│   └── tokenService.js   # Core business logic
├── routes/
│   ├── token.js
│   └── slots.js
├── middleware/
│   └── validationMiddleware.js
├── seed/
│   └── simulateOPDDay.js
└── tests/
    └── tokenAllocation.test.js
```

---

## API Endpoints Quick Reference

### Token Management
```
POST   /api/v1/tokens                    Create token
POST   /api/v1/tokens/emergency          Emergency token
GET    /api/v1/tokens                    Search tokens
GET    /api/v1/tokens/:id                Get token
PATCH  /api/v1/tokens/:id/complete       Complete
PATCH  /api/v1/tokens/:id/cancel         Cancel
```

### Slot Management
```
POST   /api/v1/slots                     Create slot
GET    /api/v1/slots                     Get all slots
GET    /api/v1/slots/available           Available slots
GET    /api/v1/slots/:id                 Get slot details
GET    /api/v1/slots/:id/statistics      Slot stats
PATCH  /api/v1/slots/:id                 Update slot
```

---

## Performance Optimization Tips

1. **Use Database Indices**
   - Already created in Token.js and OPDSlot.js

2. **Pagination for Large Queries**
   ```javascript
   // Get first 20 tokens
   GET /api/v1/tokens?limit=20&skip=0
   ```

3. **Cache Available Slots**
   - Cache for 5 minutes (not implemented, optional)

4. **Batch Operations**
   - Reallocate multiple tokens at once (implemented)

---

## Next Steps

1. ✅ Complete setup as above
2. ✅ Run simulation
3. ✅ Test APIs with Postman
4. ✅ Review simulation output
5. ✅ Connect frontend to APIs
6. ✅ Implement real-time updates (WebSocket)
7. ✅ Add comprehensive tests
8. ✅ Deploy to production

---

## Additional Resources

- **Express.js Docs:** https://expressjs.com
- **MongoDB Docs:** https://docs.mongodb.com
- **Mongoose Docs:** https://mongoosejs.com
- **REST API Design:** https://restfulapi.net
- **HTTP Status Codes:** https://httpwg.org/specs/rfc7231.html

---

## Support

For issues or questions:

1. Check IMPLEMENTATION_SUMMARY.md
2. Review API_REFERENCE.md
3. Check inline code comments
4. Run simulation to see examples
5. Review error messages carefully

---

**Setup Complete! Ready to use the OPD Token Allocation Engine.**
