const OPDSlot = require('../models/OPDSlot');
const tokenService = require('../services/tokenService');

/**
 * OPD Slot Controller
 * Manages doctor availability slots and capacity
 */

/**
 * POST /api/v1/slots
 * Create a new OPD slot
 */
exports.createSlot = async (req, res) => {
  try {
    const {
      doctorId,
      doctorName,
      date,
      slotName,
      startTime,
      endTime,
      maxCapacity = 10,
    } = req.body;

    if (!doctorId || !date || !slotName) {
      return res.status(400).json({
        error: 'Missing required fields: doctorId, date, slotName',
      });
    }

    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    const slot = new OPDSlot({
      doctor: doctorId,
      doctorName,
      date: slotDate,
      slotName,
      startTime: startTime || slotName,
      endTime: endTime || slotName,
      maxCapacity,
      currentLoad: 0,
    });

    await slot.save();

    res.status(201).json({
      success: true,
      message: 'OPD slot created successfully',
      data: slot,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/slots/:id
 * Get a specific slot with its statistics
 */
exports.getSlot = async (req, res) => {
  try {
    const slot = await OPDSlot.findById(req.params.id)
      .populate('allocatedTokens')
      .populate('waitingListTokens')
      .populate('doctor');

    if (!slot) {
      return res.status(404).json({
        error: 'Slot not found',
      });
    }

    const stats = await tokenService.getSlotStatistics(req.params.id);

    res.json({
      success: true,
      data: {
        slot,
        statistics: stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/slots/doctor/:doctorId
 * Get all slots for a doctor
 */
exports.getSlotsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const filter = { doctor: doctorId };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const slots = await OPDSlot.find(filter)
      .populate('allocatedTokens')
      .populate('waitingListTokens')
      .sort({ date: 1, slotName: 1 });

    res.json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/slots/available
 * Get available slots (with open spots)
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    const filter = { isFull: false, isOpen: true };

    if (doctorId) filter.doctor = doctorId;

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const slots = await OPDSlot.find(filter)
      .populate('doctor')
      .sort({ date: 1, slotName: 1 });

    res.json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * PATCH /api/v1/slots/:id
 * Update slot capacity or status
 */
exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxCapacity, isOpen, notes } = req.body;

    const slot = await OPDSlot.findById(id);

    if (!slot) {
      return res.status(404).json({
        error: 'Slot not found',
      });
    }

    if (maxCapacity) {
      slot.maxCapacity = maxCapacity;
    }

    if (typeof isOpen !== 'undefined') {
      slot.isOpen = isOpen;
    }

    if (notes) {
      slot.notes = notes;
    }

    await slot.save();

    res.json({
      success: true,
      message: 'Slot updated successfully',
      data: slot,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/**
 * DELETE /api/v1/slots/:id
 * Delete a slot
 */
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const slot = await OPDSlot.findByIdAndDelete(id);

    if (!slot) {
      return res.status(404).json({
        error: 'Slot not found',
      });
    }

    res.json({
      success: true,
      message: 'Slot deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/slots/:id/statistics
 * Get detailed statistics for a slot
 */
exports.getSlotStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await tokenService.getSlotStatistics(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/slots
 * Get all slots with filters
 */
exports.getAllSlots = async (req, res) => {
  try {
    const { isOpen, isFull, date } = req.query;

    const filter = {};

    if (typeof isOpen !== 'undefined') {
      filter.isOpen = isOpen === 'true';
    }

    if (typeof isFull !== 'undefined') {
      filter.isFull = isFull === 'true';
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const slots = await OPDSlot.find(filter)
      .populate('doctor')
      .sort({ date: 1, slotName: 1 });

    res.json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/slots/:id/reallocate
 * Manually trigger reallocation from waitlist
 */
exports.triggerReallocation = async (req, res) => {
  try {
    const { id } = req.params;

    const reallocated = await tokenService.reallocateFromWaitlist(id);

    res.json({
      success: true,
      message: `${reallocated.length} tokens reallocated from waitlist`,
      data: reallocated,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
