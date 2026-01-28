const Token = require('../models/Token');
const OPDSlot = require('../models/OPDSlot');
const tokenService = require('../services/tokenService');

/**
 * Token Controller
 * Handles all token allocation and management operations
 */

/**
 * POST /api/v1/tokens
 * Create a new token
 */
exports.createToken = async (req, res) => {
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
    } = req.body;

    // Validation
    if (!patientId || !doctorId || !appointmentDate) {
      return res.status(400).json({
        error: 'Missing required fields: patientId, doctorId, appointmentDate',
      });
    }

    const result = await tokenService.allocateToken({
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName,
      appointmentDate,
      appointmentTime,
      type,
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        token: result.token,
        slot: result.slot,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/tokens/emergency
 * Create an emergency token with highest priority
 */
exports.createEmergencyToken = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName,
      appointmentDate,
      appointmentTime,
    } = req.body;

    if (!patientId || !doctorId || !appointmentDate) {
      return res.status(400).json({
        error: 'Missing required fields: patientId, doctorId, appointmentDate',
      });
    }

    const result = await tokenService.addEmergencyToken({
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName,
      appointmentDate,
      appointmentTime: appointmentTime || 'ASAP',
    });

    res.status(201).json({
      success: true,
      message: 'Emergency token created successfully',
      data: {
        token: result.token,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/tokens/:id
 * Get a specific token
 */
exports.getToken = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id)
      .populate('patient')
      .populate('doctor');

    if (!token) {
      return res.status(404).json({
        error: 'Token not found',
      });
    }

    res.json({
      success: true,
      data: token,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/tokens/doctor/:doctorId/date/:date
 * Get all tokens for a doctor on a specific date
 */
exports.getTokensByDoctorAndDate = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const tokens = await tokenService.getTokensByDoctorAndDate(doctorId, date);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/tokens/patient/:patientId
 * Get all waiting tokens for a patient
 */
exports.getWaitingTokensByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const tokens = await tokenService.getWaitingTokensByPatient(patientId);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * PATCH /api/v1/tokens/:id/call
 * Call next token in queue
 */
exports.callToken = async (req, res) => {
  try {
    const { slotId } = req.body;

    if (!slotId) {
      return res.status(400).json({
        error: 'slotId is required',
      });
    }

    const token = await tokenService.callNextToken(slotId);

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} called`,
      data: token,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/**
 * PATCH /api/v1/tokens/:id/complete
 * Mark token as completed
 */
exports.completeToken = async (req, res) => {
  try {
    const { id } = req.params;

    const token = await tokenService.completeToken(id);

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} completed`,
      data: token,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/**
 * PATCH /api/v1/tokens/:id/cancel
 * Cancel a token
 */
exports.cancelToken = async (req, res) => {
  try {
    const { id } = req.params;

    const token = await tokenService.cancelToken(id);

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} cancelled`,
      data: token,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/**
 * PATCH /api/v1/tokens/:id/no-show
 * Mark token as no-show
 */
exports.noShowToken = async (req, res) => {
  try {
    const { id } = req.params;

    const token = await tokenService.noShowToken(id);

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} marked as no-show`,
      data: token,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

/**
 * DELETE /api/v1/tokens/:id
 * Delete a token
 */
exports.deleteToken = async (req, res) => {
  try {
    const { id } = req.params;

    const token = await Token.findByIdAndDelete(id);

    if (!token) {
      return res.status(404).json({
        error: 'Token not found',
      });
    }

    res.json({
      success: true,
      message: 'Token deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/tokens/search
 * Search tokens with filters
 */
exports.searchTokens = async (req, res) => {
  try {
    const { doctorId, date, status, type } = req.query;

    const filter = {};
    if (doctorId) filter.doctor = doctorId;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: startDate, $lte: endDate };
    }
    if (status) filter.status = status;
    if (type) filter.type = type;

    const tokens = await Token.find(filter)
      .populate('patient')
      .populate('doctor')
      .sort({ queuePosition: 1 });

    res.json({
      success: true,
      count: tokens.length,
      data: tokens,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
