const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const claimController = require('../controllers/claimController');
const upload = require('../middleware/upload');
const { authenticateToken, requireAuth, requireAdmin } = require('../middleware/auth');
const { validateItemInput, validateClaimInput } = require('../middleware/validate');

// Public search and browsing
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.get('/:id/matches', itemController.getItemMatches);

// Report lost or found item (supports optional image upload)
router.post(
  '/',
  authenticateToken,
  upload.single('image'),
  validateItemInput,
  itemController.createItem
);

// Submit a claim for an item
router.post(
  '/:id/claims',
  validateClaimInput,
  claimController.submitClaim
);

// Update item (creator or admin)
router.patch(
  '/:id',
  requireAuth,
  itemController.updateItem
);

// Delete item (admin only)
router.delete(
  '/:id',
  requireAdmin,
  itemController.deleteItem
);

module.exports = router;
