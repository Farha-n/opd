const Token = require('../models/Token');
const OPDSlot = require('../models/OPDSlot');
const Doctor = require('../models/Doctor');

/**
 * Priority Mapping
 * Higher value = Higher priority
 */
const PRIORITY_MAP = {
  emergency: 5,
  paid_priority: 4,
  follow_up: 3,
  online_booking: 2,
  walk_in: 1,
};

const PRIORITY_RULES = {
  emergency: 5,
  paid_priority: 4,
  follow_up: 3,
  online_booking: 2,
  walk_in: 1,
};

class TokenService {
  /**
   * Generate unique token number
   * Format: YYYY-MM-DD-DOCTORID-SEQUENCE
   */
  async generateTokenNumber(doctorId, appointmentDate) {
    const dateStr = new Date(appointmentDate).toISOString().split('T')[0];
    
    // Count tokens for this doctor on this date
    const count = await Token.countDocuments({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
    });
    
    const sequence = String(count + 1).padStart(3, '0');
    const doctorIdShort = doctorId.toString().substring(doctorId.toString().length - 6);
    
    return `TOKEN-${dateStr}-${doctorIdShort}-${sequence}`;
  }

  /**
   * Allocate a token to a patient
   * Handles priority-based allocation and slot management
   */
  async allocateToken(tokenData) {
    try {
      const {
        patientId,
        patientName,
        patientEmail,
        doctorId,
        doctorName,
        appointmentDate,
        appointmentTime,
        type = 'online_booking',
      } = tokenData;

      // Validate priority type
      if (!PRIORITY_MAP[type]) {
        throw new Error(`Invalid token type: ${type}`);
      }

      // Find or create slot for this doctor and time
      const slot = await this.getOrCreateSlot(
        doctorId,
        appointmentDate,
        appointmentTime
      );

      // Generate token number
      const tokenNumber = await this.generateTokenNumber(doctorId, appointmentDate);

      // Determine if token can be allocated or goes to waitlist
      const isOnWaitingList = slot.currentLoad >= slot.maxCapacity;

      // Create token
      const token = new Token({
        tokenNumber,
        patient: patientId,
        patientName,
        patientEmail,
        doctor: doctorId,
        doctorName,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        type,
        priorityLevel: PRIORITY_MAP[type],
        status: isOnWaitingList ? 'waiting' : 'waiting', // Both start as waiting, position differs
        isOnWaitingList,
        allocatedAt: new Date(),
      });

      await token.save();

      // Update slot
      if (!isOnWaitingList) {
        slot.currentLoad += 1;
        slot.allocatedTokens.push(token._id);
      } else {
        slot.waitingListTokens.push(token._id);
      }

      // Check if slot is now full
      if (slot.currentLoad >= slot.maxCapacity) {
        slot.isFull = true;
      }

      await slot.save();

      // Reorder queue based on priority
      await this.reorderQueue(slot._id);

      return {
        success: true,
        token,
        slot,
        message: isOnWaitingList
          ? 'Added to waiting list. Will be allocated when slot opens.'
          : 'Token allocated successfully.',
      };
    } catch (error) {
      throw new Error(`Token allocation failed: ${error.message}`);
    }
  }

  /**
   * Get or create OPD slot
   */
  async getOrCreateSlot(doctorId, appointmentDate, appointmentTime) {
    const date = new Date(appointmentDate);
    date.setHours(0, 0, 0, 0);

    let slot = await OPDSlot.findOne({
      doctor: doctorId,
      date: date,
      slotName: appointmentTime,
    });

    if (!slot) {
      const doctor = await Doctor.findById(doctorId);
      slot = new OPDSlot({
        doctor: doctorId,
        doctorName: doctor?.name || 'Unknown',
        date: date,
        slotName: appointmentTime,
        startTime: appointmentTime,
        endTime: appointmentTime,
        maxCapacity: 10,
        currentLoad: 0,
      });

      await slot.save();
    }

    return slot;
  }

  /**
   * Reorder queue by priority and time
   * Higher priority tokens come first
   */
  async reorderQueue(slotId) {
    const slot = await OPDSlot.findById(slotId).populate('allocatedTokens');

    // Sort allocated tokens by priority (descending) and creation time (ascending)
    const sorted = slot.allocatedTokens.sort((a, b) => {
      if (b.priorityLevel !== a.priorityLevel) {
        return b.priorityLevel - a.priorityLevel;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    // Update queue positions
    for (let i = 0; i < sorted.length; i++) {
      await Token.findByIdAndUpdate(sorted[i]._id, {
        queuePosition: i + 1,
      });
    }

    slot.allocatedTokens = sorted.map(t => t._id);
    await slot.save();
  }

  /**
   * Reallocate tokens when a slot becomes available
   * Called when a token is completed/cancelled
   */
  async reallocateFromWaitlist(slotId) {
    const slot = await OPDSlot.findById(slotId).populate('waitingListTokens');

    const availableSpots = slot.maxCapacity - slot.currentLoad;

    if (availableSpots <= 0 || slot.waitingListTokens.length === 0) {
      return [];
    }

    // Sort waitlist by priority and time
    const sortedWaitlist = slot.waitingListTokens.sort((a, b) => {
      if (b.priorityLevel !== a.priorityLevel) {
        return b.priorityLevel - a.priorityLevel;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const reallocated = [];

    for (let i = 0; i < Math.min(availableSpots, sortedWaitlist.length); i++) {
      const token = sortedWaitlist[i];
      token.isOnWaitingList = false;
      token.isReallocated = true;
      await token.save();

      slot.allocatedTokens.push(token._id);
      slot.currentLoad += 1;

      reallocated.push(token);
    }

    // Remove reallocated tokens from waitlist
    slot.waitingListTokens = slot.waitingListTokens.filter(
      t => !reallocated.find(r => r._id.equals(t._id))
    );

    if (slot.currentLoad < slot.maxCapacity) {
      slot.isFull = false;
    }

    await slot.save();

    // Reorder the queue
    await this.reorderQueue(slotId);

    return reallocated;
  }

  /**
   * Call next token in queue
   */
  async callNextToken(slotId) {
    const slot = await OPDSlot.findById(slotId).populate('allocatedTokens');

    if (slot.allocatedTokens.length === 0) {
      throw new Error('No tokens available in this slot');
    }

    // Get first token (highest priority)
    const token = slot.allocatedTokens[0];

    if (token.status === 'called' || token.status === 'in_progress') {
      throw new Error('Current token is already being processed');
    }

    token.status = 'called';
    token.calledAt = new Date();
    await token.save();

    return token;
  }

  /**
   * Complete a token consultation
   */
  async completeToken(tokenId) {
    const token = await Token.findById(tokenId);

    if (!token) {
      throw new Error('Token not found');
    }

    token.status = 'completed';
    token.completedAt = new Date();
    await token.save();

    // Find the slot and reallocate from waitlist
    const slot = await OPDSlot.findOne({
      doctor: token.doctor,
      date: new Date(token.appointmentDate),
    });

    if (slot) {
      // Remove token from slot
      slot.allocatedTokens = slot.allocatedTokens.filter(
        t => !t.equals(token._id)
      );
      slot.currentLoad -= 1;
      slot.completedCount += 1;
      await slot.save();

      // Reallocate from waitlist
      await this.reallocateFromWaitlist(slot._id);
    }

    return token;
  }

  /**
   * Cancel a token
   */
  async cancelToken(tokenId) {
    const token = await Token.findById(tokenId);

    if (!token) {
      throw new Error('Token not found');
    }

    if (token.status === 'completed' || token.status === 'cancelled') {
      throw new Error(`Cannot cancel token with status: ${token.status}`);
    }

    token.status = 'cancelled';
    await token.save();

    // Find the slot and handle removal
    const slot = await OPDSlot.findOne({
      doctor: token.doctor,
      date: new Date(token.appointmentDate),
    });

    if (slot) {
      if (!token.isOnWaitingList) {
        slot.allocatedTokens = slot.allocatedTokens.filter(
          t => !t.equals(token._id)
        );
        slot.currentLoad -= 1;
      } else {
        slot.waitingListTokens = slot.waitingListTokens.filter(
          t => !t.equals(token._id)
        );
      }

      slot.cancelledCount += 1;
      await slot.save();

      // Reallocate from waitlist
      if (!token.isOnWaitingList) {
        await this.reallocateFromWaitlist(slot._id);
      }
    }

    return token;
  }

  /**
   * Mark token as no-show
   */
  async noShowToken(tokenId) {
    const token = await Token.findById(tokenId);

    if (!token) {
      throw new Error('Token not found');
    }

    token.status = 'no_show';
    await token.save();

    // Find the slot and handle removal
    const slot = await OPDSlot.findOne({
      doctor: token.doctor,
      date: new Date(token.appointmentDate),
    });

    if (slot) {
      if (!token.isOnWaitingList) {
        slot.allocatedTokens = slot.allocatedTokens.filter(
          t => !t.equals(token._id)
        );
        slot.currentLoad -= 1;
      }

      slot.noShowCount += 1;
      await slot.save();

      // Reallocate from waitlist
      if (!token.isOnWaitingList) {
        await this.reallocateFromWaitlist(slot._id);
      }
    }

    return token;
  }

  /**
   * Get all tokens for a doctor on a specific date
   */
  async getTokensByDoctorAndDate(doctorId, date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return await Token.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate('patient')
      .sort({ queuePosition: 1 });
  }

  /**
   * Get all waiting tokens for a patient
   */
  async getWaitingTokensByPatient(patientId) {
    return await Token.find({
      patient: patientId,
      status: 'waiting',
    })
      .populate('doctor')
      .sort({ createdAt: -1 });
  }

  /**
   * Get queue statistics for a slot
   */
  async getSlotStatistics(slotId) {
    const slot = await OPDSlot.findById(slotId).populate([
      'allocatedTokens',
      'waitingListTokens',
    ]);

    const allocatedByPriority = {};
    const waitlistByPriority = {};

    slot.allocatedTokens.forEach(token => {
      const type = token.type;
      allocatedByPriority[type] = (allocatedByPriority[type] || 0) + 1;
    });

    slot.waitingListTokens.forEach(token => {
      const type = token.type;
      waitlistByPriority[type] = (waitlistByPriority[type] || 0) + 1;
    });

    return {
      slot: {
        id: slot._id,
        doctor: slot.doctorName,
        date: slot.date,
        slotName: slot.slotName,
        maxCapacity: slot.maxCapacity,
        currentLoad: slot.currentLoad,
        availableSpots: slot.availableSpots,
        isFull: slot.isFull,
      },
      allocatedCount: slot.allocatedTokens.length,
      allocatedByPriority,
      waitlistCount: slot.waitingListTokens.length,
      waitlistByPriority,
      completedCount: slot.completedCount,
      noShowCount: slot.noShowCount,
      cancelledCount: slot.cancelledCount,
    };
  }

  /**
   * Handle emergency insertion
   * Emergency tokens get immediate slot (can exceed capacity temporarily)
   */
  async addEmergencyToken(tokenData) {
    try {
      const token = await this.allocateToken({
        ...tokenData,
        type: 'emergency',
      });

      // Emergency tokens can exceed capacity
      const slot = await OPDSlot.findOne({
        doctor: tokenData.doctorId,
        date: new Date(tokenData.appointmentDate),
      });

      if (slot) {
        slot.notes = `Emergency token added. Capacity exceeded by ${slot.currentLoad - slot.maxCapacity}`;
        await slot.save();
      }

      return token;
    } catch (error) {
      throw new Error(`Emergency token addition failed: ${error.message}`);
    }
  }
}

const tokenServiceInstance = new TokenService();
tokenServiceInstance.PRIORITY_MAP = PRIORITY_MAP;

module.exports = tokenServiceInstance;
