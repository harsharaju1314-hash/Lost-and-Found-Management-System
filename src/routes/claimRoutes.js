const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateClaimStatusUpdate } = require('../middleware/validate');

// Public tracking endpoint by claim code
router.get('/track/:code', claimController.trackClaimByCode);

// List claims (admin all claims or claimant filter)
router.get('/', authenticateToken, claimController.getClaims);

// Get detailed claim by ID (admin or claimant)
router.get('/:id', authenticateToken, claimController.getClaimById);

// Update claim status & resolution note (admin only)
router.patch(
  '/:id',
  requireAdmin,
  validateClaimStatusUpdate,
  claimController.updateClaimStatus
);

module.exports = router;
