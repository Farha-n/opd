const mongoose = require('mongoose');

/**
 * OPD Slot Schema
 * Manages doctor availability slots with fixed time windows and capacity
 */
const opdSlotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  doctorName: String,
  
  // Slot Timing
  date: {
    type: Date,
    required: true,
  },
  startTime: String, // e.g., "09:00"
  endTime: String,   // e.g., "10:00"
  slotName: String,  // e.g., "Morning Slot 1" or "09:00 AM"
  
  // Capacity
  maxCapacity: {
    type: Number,
    required: true,
    default: 10, // Default: 10 patients per slot
  },
  
  currentLoad: {
    type: Number,
    default: 0, // Current number of allocated tokens
  },
  
  availableSpots: {
    type: Number,
    default: function() {
      return this.maxCapacity - this.currentLoad;
    }
  },
  
  // Allocation Details
  allocatedTokens: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
    }
  ],
  
  // Status
  isOpen: { type: Boolean, default: true },
  isFull: { type: Boolean, default: false },
  
  // Waitlist for this slot
  waitingListTokens: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
    }
  ],
  
  // Statistics
  completedCount: { type: Number, default: 0 },
  noShowCount: { type: Number, default: 0 },
  cancelledCount: { type: Number, default: 0 },
  
  // Metadata
  notes: String,
  
}, { timestamps: true });

// Index for efficient queries
opdSlotSchema.index({ doctor: 1, date: 1, startTime: 1 });
opdSlotSchema.index({ date: 1, isOpen: 1 });

module.exports = mongoose.model('OPDSlot', opdSlotSchema);
