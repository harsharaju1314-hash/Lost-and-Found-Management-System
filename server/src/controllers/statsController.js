const { getDatabase } = require('../database/db');

function getOverviewStats(req, res, next) {
  try {
    const db = getDatabase();

    const totalLost = db.prepare("SELECT COUNT(*) AS count FROM items WHERE type = 'lost'").get().count;
    const totalFound = db.prepare("SELECT COUNT(*) AS count FROM items WHERE type = 'found'").get().count;
    const totalResolved = db.prepare("SELECT COUNT(*) AS count FROM items WHERE status IN ('claimed', 'returned')").get().count;
    const totalPendingClaims = db.prepare("SELECT COUNT(*) AS count FROM claims WHERE status = 'pending'").get().count;
    const totalApprovedClaims = db.prepare("SELECT COUNT(*) AS count FROM claims WHERE status = 'approved'").get().count;

    const categoryBreakdown = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM items
      GROUP BY category
      ORDER BY count DESC
    `).all();

    const recentActivity = db.prepare(`
      SELECT id, type, title, category, location, status, date_occurred, created_at
      FROM items
      ORDER BY created_at DESC
      LIMIT 6
    `).all();

    res.json({
      success: true,
      stats: {
        totalLost,
        totalFound,
        totalResolved,
        totalPendingClaims,
        totalApprovedClaims,
        categoryBreakdown,
        recentActivity
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverviewStats
};
