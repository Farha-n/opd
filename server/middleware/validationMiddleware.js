/**
 * Token Allocation Validation Middleware
 * Validates request payloads and parameters
 */

const validateTokenCreation = (req, res, next) => {
  const { patientId, doctorId, appointmentDate, type } = req.body;

  // Check required fields
  if (!patientId) {
    return res.status(400).json({ error: 'patientId is required' });
  }
  if (!doctorId) {
    return res.status(400).json({ error: 'doctorId is required' });
  }
  if (!appointmentDate) {
    return res.status(400).json({ error: 'appointmentDate is required' });
  }

  // Validate token type
  const validTypes = ['emergency', 'paid_priority', 'follow_up', 'online_booking', 'walk_in'];
  if (type && !validTypes.includes(type)) {
    return res.status(400).json({
      error: `Invalid token type. Must be one of: ${validTypes.join(', ')}`,
    });
  }

  // Validate date format (YYYY-MM-DD or ISO format)
  const date = new Date(appointmentDate);
  if (isNaN(date.getTime())) {
    return res.status(400).json({ error: 'Invalid appointmentDate format' });
  }

  // Validate MongoDB ObjectId format
  if (!isValidObjectId(patientId)) {
    return res.status(400).json({ error: 'Invalid patientId format' });
  }
  if (!isValidObjectId(doctorId)) {
    return res.status(400).json({ error: 'Invalid doctorId format' });
  }

  next();
};

const validateSlotCreation = (req, res, next) => {
  const { doctorId, date, slotName, maxCapacity } = req.body;

  // Check required fields
  if (!doctorId) {
    return res.status(400).json({ error: 'doctorId is required' });
  }
  if (!date) {
    return res.status(400).json({ error: 'date is required' });
  }
  if (!slotName) {
    return res.status(400).json({ error: 'slotName is required' });
  }

  // Validate date format
  const slotDate = new Date(date);
  if (isNaN(slotDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  // Validate maxCapacity
  if (maxCapacity && (maxCapacity < 1 || maxCapacity > 100)) {
    return res.status(400).json({
      error: 'maxCapacity must be between 1 and 100',
    });
  }

  // Validate MongoDB ObjectId
  if (!isValidObjectId(doctorId)) {
    return res.status(400).json({ error: 'Invalid doctorId format' });
  }

  next();
};

const validateMongoId = (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  next();
};

const validateQueryParams = (req, res, next) => {
  const { doctorId, date, status, type } = req.query;

  // Validate doctor ID if provided
  if (doctorId && !isValidObjectId(doctorId)) {
    return res.status(400).json({ error: 'Invalid doctorId format' });
  }

  // Validate date if provided
  if (date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
  }

  // Validate status if provided
  if (status) {
    const validStatuses = ['waiting', 'called', 'in_progress', 'completed', 'no_show', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }
  }

  // Validate type if provided
  if (type) {
    const validTypes = ['emergency', 'paid_priority', 'follow_up', 'online_booking', 'walk_in'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
      });
    }
  }

  next();
};

/**
 * Helper function to validate MongoDB ObjectId
 */
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Rate limiting middleware for token allocation
 * Prevents abuse by limiting requests per IP per minute
 */
const tokenRateLimit = (() => {
  const requestLog = new Map();
  const LIMIT = 30; // 30 requests per minute
  const WINDOW = 60000; // 1 minute in milliseconds

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requestLog.has(ip)) {
      requestLog.set(ip, []);
    }

    const requests = requestLog.get(ip).filter(time => now - time < WINDOW);

    if (requests.length >= LIMIT) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
      });
    }

    requests.push(now);
    requestLog.set(ip, requests);

    next();
  };
})();

module.exports = {
  validateTokenCreation,
  validateSlotCreation,
  validateMongoId,
  validateQueryParams,
  tokenRateLimit,
  isValidObjectId,
};
