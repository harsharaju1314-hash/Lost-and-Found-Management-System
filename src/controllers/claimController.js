const crypto = require('crypto');
const { getDatabase } = require('../database/db');

function generateClaimCode() {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CLM-${randomHex}`;
}

function submitClaim(req, res, next) {
  try {
    const db = getDatabase();
    const { id: itemId } = req.params;
    const { claimant_name, claimant_email, claimant_phone, description_proof, date_lost } = req.body;

    // Verify item exists and is open for claiming
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'The item you are claiming does not exist.'
      });
    }

    if (item.status !== 'open') {
      return res.status(400).json({
        success: false,
        error: `This item is currently marked as "${item.status}" and cannot accept new claims.`
      });
    }

    // Generate unique claim tracking code
    let claimCode = generateClaimCode();
    let codeExists = db.prepare('SELECT id FROM claims WHERE claim_code = ?').get(claimCode);
    while (codeExists) {
      claimCode = generateClaimCode();
      codeExists = db.prepare('SELECT id FROM claims WHERE claim_code = ?').get(claimCode);
    }

    const insertClaim = db.prepare(`
      INSERT INTO claims (
        claim_code, item_id, claimant_name, claimant_email, claimant_phone,
        description_proof, date_lost, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    const result = insertClaim.run(
      claimCode,
      Number(itemId),
      claimant_name.trim(),
      claimant_email.trim().toLowerCase(),
      claimant_phone ? claimant_phone.trim() : null,
      description_proof.trim(),
      date_lost || null
    );

    const claimId = result.lastInsertRowid;

    // Record initial status update
    db.prepare(`
      INSERT INTO claim_updates (claim_id, previous_status, new_status, note, updated_by)
      VALUES (?, 'none', 'pending', 'Claim submitted by claimant. Waiting for reviewer assessment.', 'System')
    `).run(Number(claimId));

    const createdClaim = db.prepare('SELECT * FROM claims WHERE id = ?').get(claimId);

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. Save your Claim Tracking Code to monitor progress.',
      claim: createdClaim,
      claimCode: createdClaim.claim_code
    });
  } catch (err) {
    next(err);
  }
}

function getClaims(req, res, next) {
  try {
    const db = getDatabase();
    const { status, search, claimant_email } = req.query;

    let query = `
      SELECT c.*, i.title AS item_title, i.category AS item_category, i.type AS item_type, i.location AS item_location, i.status AS item_status
      FROM claims c
      JOIN items i ON c.item_id = i.id
      WHERE 1=1
    `;
    const params = [];

    // If regular user requesting their own claims
    if (claimant_email) {
      query += ' AND c.claimant_email = ?';
      params.push(claimant_email.trim().toLowerCase());
    } else if (!req.user || req.user.role !== 'admin') {
      // Non-admins cannot list all claims without specifying their email
      return res.status(403).json({
        success: false,
        error: 'Administrator access required to list all submitted claims.'
      });
    }

    if (status && status !== 'all') {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      query += ' AND (c.claim_code LIKE ? OR c.claimant_name LIKE ? OR c.claimant_email LIKE ? OR i.title LIKE ?)';
      const keyword = `%${search.trim()}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    query += ' ORDER BY c.created_at DESC';

    const claims = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: claims.length,
      claims
    });
  } catch (err) {
    next(err);
  }
}

function getClaimById(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const claim = db.prepare(`
      SELECT c.*, i.title AS item_title, i.category AS item_category, i.type AS item_type,
             i.location AS item_location, i.date_occurred AS item_date, i.status AS item_status,
             i.image_url AS item_image_url
      FROM claims c
      JOIN items i ON c.item_id = i.id
      WHERE c.id = ?
    `).get(id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found.'
      });
    }

    // Access check: only admin or the claimant email can view full claim details
    if (req.user && req.user.role !== 'admin' && req.user.email !== claim.claimant_email) {
      return res.status(403).json({
        success: false,
        error: 'You do not have authorization to view this claim.'
      });
    }

    const updates = db.prepare(`
      SELECT * FROM claim_updates
      WHERE claim_id = ?
      ORDER BY created_at ASC
    `).all(id);

    res.json({
      success: true,
      claim: {
        ...claim,
        history: updates
      }
    });
  } catch (err) {
    next(err);
  }
}

function trackClaimByCode(req, res, next) {
  try {
    const db = getDatabase();
    const { code } = req.params;

    const claim = db.prepare(`
      SELECT c.id, c.claim_code, c.item_id, c.claimant_name, c.status, c.admin_notes, c.created_at, c.updated_at,
             i.title AS item_title, i.category AS item_category, i.type AS item_type, i.location AS item_location, i.status AS item_status
      FROM claims c
      JOIN items i ON c.item_id = i.id
      WHERE c.claim_code = ?
    `).get(code.trim().toUpperCase());

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'No claim found with the specified tracking code. Please double check and try again.'
      });
    }

    const updates = db.prepare(`
      SELECT id, previous_status, new_status, note, updated_by, created_at
      FROM claim_updates
      WHERE claim_id = ?
      ORDER BY created_at ASC
    `).all(claim.id);

    res.json({
      success: true,
      claim: {
        ...claim,
        history: updates
      }
    });
  } catch (err) {
    next(err);
  }
}

function updateClaimStatus(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const existingClaim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
    if (!existingClaim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found.'
      });
    }

    const reviewerId = req.user ? req.user.id : null;
    const reviewerName = req.user ? `${req.user.username} (Admin)` : 'Administrator';

    // Update claim
    db.prepare(`
      UPDATE claims
      SET status = ?, admin_notes = ?, reviewed_by_user_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, admin_notes || null, reviewerId, id);

    // Record audit update
    db.prepare(`
      INSERT INTO claim_updates (claim_id, previous_status, new_status, note, updated_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id,
      existingClaim.status,
      status,
      admin_notes || `Status changed from ${existingClaim.status} to ${status}.`,
      reviewerName
    );

    // If claim is approved, automatically update item status to 'claimed'
    if (status === 'approved') {
      db.prepare(`
        UPDATE items
        SET status = 'claimed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(existingClaim.item_id);

      // Also set any other pending claims on this item to 'rejected' with note
      db.prepare(`
        UPDATE claims
        SET status = 'rejected', admin_notes = 'Another claim for this item was verified and approved.', updated_at = CURRENT_TIMESTAMP
        WHERE item_id = ? AND id != ? AND status = 'pending'
      `).run(existingClaim.item_id, id);
    } else if (status === 'rejected' && existingClaim.status === 'approved') {
      // Revert item back to open if the only approved claim was rejected
      db.prepare(`
        UPDATE items
        SET status = 'open', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(existingClaim.item_id);
    }

    const updatedClaim = db.prepare('SELECT * FROM claims WHERE id = ?').get(id);
    const updates = db.prepare('SELECT * FROM claim_updates WHERE claim_id = ? ORDER BY created_at ASC').all(id);

    res.json({
      success: true,
      message: `Claim status successfully updated to "${status}".`,
      claim: {
        ...updatedClaim,
        history: updates
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitClaim,
  getClaims,
  getClaimById,
  trackClaimByCode,
  updateClaimStatus
};
