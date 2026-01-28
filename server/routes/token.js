const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const {
  validateTokenCreation,
  validateMongoId,
  validateQueryParams,
  tokenRateLimit,
} = require('../middleware/validationMiddleware');

/**
 * Token Routes - OPD Token Allocation Engine
 * Base: /api/v1/tokens
 */

// Apply rate limiting to all token routes
router.use(tokenRateLimit);

// Search tokens with filters (query endpoint)
router.get('/', validateQueryParams, tokenController.searchTokens);

// Create a new token
router.post('/', validateTokenCreation, tokenController.createToken);

// Create an emergency token
router.post('/emergency', validateTokenCreation, tokenController.createEmergencyToken);

// Get a specific token
router.get('/:id', validateMongoId, tokenController.getToken);

// Get tokens by doctor and date
router.get('/doctor/:doctorId/date/:date', tokenController.getTokensByDoctorAndDate);

// Get waiting tokens for a patient
router.get('/patient/:patientId', tokenController.getWaitingTokensByPatient);

// Call next token
router.patch('/:id/call', validateMongoId, tokenController.callToken);

// Complete a token
router.patch('/:id/complete', validateMongoId, tokenController.completeToken);

// Cancel a token
router.patch('/:id/cancel', validateMongoId, tokenController.cancelToken);

// Mark token as no-show
router.patch('/:id/no-show', validateMongoId, tokenController.noShowToken);

// Delete a token
router.delete('/:id', validateMongoId, tokenController.deleteToken);

module.exports = router;
