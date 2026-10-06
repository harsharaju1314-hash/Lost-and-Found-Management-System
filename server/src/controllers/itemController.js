const { getDatabase } = require('../database/db');
const { findMatches } = require('../services/matchingService');

function getItems(req, res, next) {
  try {
    const db = getDatabase();
    const {
      q,
      category,
      location,
      type,
      status,
      limit = 50,
      offset = 0
    } = req.query;

    let query = `
      SELECT id, type, title, category, description, location, date_occurred, status, image_url, contact_name, created_at
      FROM items
      WHERE 1=1
    `;
    const params = [];

    if (type && (type === 'lost' || type === 'found')) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (location && location.trim()) {
      query += ' AND location LIKE ?';
      params.push(`%${location.trim()}%`);
    }

    if (q && q.trim()) {
      query += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)';
      const keyword = `%${q.trim()}%`;
      params.push(keyword, keyword, keyword);
    }

    // Count total matching
    const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    const countResult = db.prepare(countQuery).get(...params);
    const total = countResult ? countResult.total : 0;

    query += ' ORDER BY date_occurred DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const items = db.prepare(query).all(...params);

    res.json({
      success: true,
      total,
      limit: Number(limit),
      offset: Number(offset),
      items
    });
  } catch (err) {
    next(err);
  }
}

function getItemById(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const item = db.prepare(`
      SELECT id, type, title, category, description, location, date_occurred, status, image_url, contact_name, created_by_user_id, created_at, updated_at
      FROM items
      WHERE id = ?
    `).get(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found.'
      });
    }

    // Also get rule-based match suggestions for this item
    const potentialMatches = findMatches(item, db, 4);

    res.json({
      success: true,
      item,
      potentialMatches
    });
  } catch (err) {
    next(err);
  }
}

function createItem(req, res, next) {
  try {
    const db = getDatabase();
    const {
      type,
      title,
      category,
      description,
      location,
      date_occurred,
      contact_name,
      contact_email,
      contact_phone
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      imageUrl = req.body.image_url;
    }

    const userId = req.user ? req.user.id : null;

    const stmt = db.prepare(`
      INSERT INTO items (
        type, title, category, description, location, date_occurred, status, image_url,
        contact_name, contact_email, contact_phone, created_by_user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      type.trim().toLowerCase(),
      title.trim(),
      category.trim(),
      description.trim(),
      location.trim(),
      date_occurred.trim(),
      imageUrl,
      contact_name ? contact_name.trim() : null,
      contact_email ? contact_email.trim() : null,
      contact_phone ? contact_phone.trim() : null,
      userId
    );

    const createdItem = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
    const potentialMatches = findMatches(createdItem, db, 4);

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully.`,
      item: createdItem,
      potentialMatches
    });
  } catch (err) {
    next(err);
  }
}

function updateItem(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { status, title, description, location, category } = req.body;

    const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Item not found.'
      });
    }

    // Only admin or item creator can update
    if (req.user && req.user.role !== 'admin' && existing.created_by_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to modify this item.'
      });
    }

    const updatedStatus = status || existing.status;
    const updatedTitle = title || existing.title;
    const updatedDescription = description || existing.description;
    const updatedLocation = location || existing.location;
    const updatedCategory = category || existing.category;

    db.prepare(`
      UPDATE items
      SET status = ?, title = ?, description = ?, location = ?, category = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(updatedStatus, updatedTitle, updatedDescription, updatedLocation, updatedCategory, id);

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Item updated successfully.',
      item: updatedItem
    });
  } catch (err) {
    next(err);
  }
}

function deleteItem(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Item not found.'
      });
    }

    db.prepare('DELETE FROM items WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Item deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

function getItemMatches(req, res, next) {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found.'
      });
    }

    const matches = findMatches(item, db, 8);

    res.json({
      success: true,
      itemId: Number(id),
      itemTitle: item.title,
      itemType: item.type,
      matchingAlgorithm: 'Deterministic rule-based heuristic (Category, Location, Date proximity, Keywords)',
      matches
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getItemMatches
};
