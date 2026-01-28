const express = require('express');
const router = express.Router();
const opdSlotController = require('../controllers/opdSlotController');
const {
  validateSlotCreation,
  validateMongoId,
  tokenRateLimit,
} = require('../middleware/validationMiddleware');

/**
 * OPD Slot Routes - Doctor Availability Management
 * Base: /api/v1/slots
 */

// Apply rate limiting
router.use(tokenRateLimit);

// Get all slots with filters
router.get('/', opdSlotController.getAllSlots);

// Get available slots (with open spots)
router.get('/available', opdSlotController.getAvailableSlots);

// Create a new slot
router.post('/', validateSlotCreation, opdSlotController.createSlot);

// Get a specific slot
router.get('/:id', validateMongoId, opdSlotController.getSlot);

// Get statistics for a slot
router.get('/:id/statistics', validateMongoId, opdSlotController.getSlotStatistics);

// Get slots for a doctor
router.get('/doctor/:doctorId', opdSlotController.getSlotsByDoctor);

// Update a slot
router.patch('/:id', validateMongoId, opdSlotController.updateSlot);

// Trigger reallocation from waitlist
router.post('/:id/reallocate', validateMongoId, opdSlotController.triggerReallocation);

// Delete a slot
router.delete('/:id', validateMongoId, opdSlotController.deleteSlot);

module.exports = router;
