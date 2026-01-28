const mongoose = require('mongoose');

/**
 * Token Schema for OPD Token Allocation Engine
 * 
 * Priority Levels (Higher number = Higher priority):
 * 1. Emergency (Priority: 5)
 * 2. Paid Priority (Priority: 4)
 * 3. Follow-up (Priority: 3)
 * 4. Online Booking (Priority: 2)
 * 5. Walk-in (Priority: 1)
 */
const tokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: String,
    required: true,
    unique: true,
    // Format: YYYY-MM-DD-DOCTOR_ID-SEQ (e.g., 2024-12-28-doc001-001)
  },
  
  // Patient Information
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: String,
  patientEmail: String,
  
  // Doctor Information
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  doctorName: String,
  
  // Slot Information
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: String, // e.g., "10:00 AM"
  
  // Token Type & Priority
  type: {
    type: String,
    enum: ['emergency', 'paid_priority', 'follow_up', 'online_booking', 'walk_in'],
    default: 'online_booking',
  },
  
  priorityLevel: {
    type: Number,
    enum: [1, 2, 3, 4, 5], // 5 = highest (emergency), 1 = lowest (walk-in)
    required: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['waiting', 'called', 'in_progress', 'completed', 'no_show', 'cancelled'],
    default: 'waiting',
  },
  
  // Position in Queue
  queuePosition: {
    type: Number,
    default: 0, // Will be set when token is allocated
  },
  
  // Allocation Details
  allocatedAt: Date,
  calledAt: Date,
  completedAt: Date,
  
  // Additional Info
  notes: String,
  isReallocated: { type: Boolean, default: false },
  originalAllocationDate: Date,

  // Waiting List
  isOnWaitingList: { type: Boolean, default: false },
  waitlistPosition: Number,
  
}, { timestamps: true });

// Index for efficient queries
tokenSchema.index({ doctor: 1, appointmentDate: 1, priorityLevel: -1 });
tokenSchema.index({ patient: 1, status: 1 });

module.exports = mongoose.model('Token', tokenSchema);
