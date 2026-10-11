/**
 * Input validation helpers and middleware
 */

const ALLOWED_CATEGORIES = [
  'Electronics',
  'Wallets & Bags',
  'Keys & Badges',
  'Documents & IDs',
  'Clothing & Accessories',
  'Jewelry',
  'Books & Stationery',
  'Other'
];

function validateItemInput(req, res, next) {
  const { type, title, category, description, location, date_occurred } = req.body;
  const errors = [];

  if (!type || !['lost', 'found'].includes(type)) {
    errors.push('Item type must be either "lost" or "found".');
  }

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters.');
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category.trim())) {
    errors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`);
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    errors.push('Description is required and must be at least 5 characters.');
  }

  if (!location || typeof location !== 'string' || location.trim().length < 2) {
    errors.push('Location is required.');
  }

  if (!date_occurred || !/^\d{4}-\d{2}-\d{2}$/.test(date_occurred)) {
    errors.push('Date must be in valid YYYY-MM-DD format.');
  }

  // Optional email format validation if provided
  if (req.body.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.contact_email)) {
    errors.push('Contact email is not a valid email address.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

function validateClaimInput(req, res, next) {
  const { claimant_name, claimant_email, description_proof } = req.body;
  const errors = [];

  if (!claimant_name || typeof claimant_name !== 'string' || claimant_name.trim().length < 2) {
    errors.push('Claimant full name is required (at least 2 characters).');
  }

  if (!claimant_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claimant_email)) {
    errors.push('A valid contact email address is required.');
  }

  if (!description_proof || typeof description_proof !== 'string' || description_proof.trim().length < 15) {
    errors.push('Detailed proof or distinguishing features are required (at least 15 characters) to verify ownership.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

function validateClaimStatusUpdate(req, res, next) {
  const { status, admin_notes } = req.body;
  const errors = [];

  const allowedStatuses = ['pending', 'under_review', 'approved', 'rejected'];
  if (!status || !allowedStatuses.includes(status)) {
    errors.push(`Status must be one of: ${allowedStatuses.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

module.exports = {
  ALLOWED_CATEGORIES,
  validateItemInput,
  validateClaimInput,
  validateClaimStatusUpdate
};
