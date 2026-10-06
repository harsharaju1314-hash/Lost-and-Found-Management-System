/**
 * Simple Rule-Based Matching Service
 * 
 * NOTE: This is a deterministic, rule-based matching engine.
 * It does NOT use Machine Learning or AI models.
 * Matches are scored based on four transparent heuristics:
 * 1. Category equality (Weight: 35 pts)
 * 2. Location token overlap (Weight: 25 pts)
 * 3. Date proximity (Weight: 20 pts)
 * 4. Title & Description keyword overlap (Weight: 20 pts)
 */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'of', 'for', 'to', 'from', 'with', 'by',
  'and', 'or', 'but', 'is', 'are', 'was', 'were', 'it', 'its', 'my', 'i', 'lost',
  'found', 'item', 'has', 'have', 'had', 'near', 'around', 'left', 'inside', 'outside'
]);

function extractKeywords(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOPWORDS.has(word));
}

function calculateDateDifferenceDays(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function calculateScore(targetItem, candidateItem) {
  let score = 0;
  const reasons = [];

  // 1. Category Matching (35 points)
  if (targetItem.category && candidateItem.category && targetItem.category.toLowerCase() === candidateItem.category.toLowerCase()) {
    score += 35;
    reasons.push(`Exact category match: "${candidateItem.category}"`);
  }

  // 2. Location Similarity (up to 25 points)
  const targetLocWords = extractKeywords(targetItem.location);
  const candidateLocWords = extractKeywords(candidateItem.location);
  const commonLocWords = targetLocWords.filter(w => candidateLocWords.includes(w));

  if (commonLocWords.length > 0) {
    const locRatio = commonLocWords.length / Math.max(1, Math.min(targetLocWords.length, candidateLocWords.length));
    const locScore = Math.min(25, Math.round(locRatio * 25));
    score += locScore;
    reasons.push(`Location keyword overlap (${commonLocWords.slice(0, 3).join(', ')})`);
  }

  // 3. Date Proximity (up to 20 points)
  const diffDays = calculateDateDifferenceDays(targetItem.date_occurred, candidateItem.date_occurred);
  if (diffDays <= 2) {
    score += 20;
    reasons.push(`Reported dates within 2 days (${diffDays === 0 ? 'same day' : `${diffDays} day(s) apart`})`);
  } else if (diffDays <= 5) {
    score += 15;
    reasons.push(`Reported dates within 5 days (${diffDays} days apart)`);
  } else if (diffDays <= 10) {
    score += 10;
    reasons.push(`Reported dates within 10 days (${diffDays} days apart)`);
  } else if (diffDays <= 30) {
    score += 5;
    reasons.push(`Reported dates within 30 days (${diffDays} days apart)`);
  }

  // 4. Keyword Overlap across Title & Description (up to 20 points)
  const targetText = `${targetItem.title || ''} ${targetItem.description || ''}`;
  const candidateText = `${candidateItem.title || ''} ${candidateItem.description || ''}`;

  const targetKeywords = Array.from(new Set(extractKeywords(targetText)));
  const candidateKeywords = Array.from(new Set(extractKeywords(candidateText)));
  const matchingKeywords = targetKeywords.filter(k => candidateKeywords.includes(k));

  if (matchingKeywords.length > 0) {
    const keywordScore = Math.min(20, matchingKeywords.length * 6);
    score += keywordScore;
    reasons.push(`Shared keywords: ${matchingKeywords.slice(0, 4).join(', ')}`);
  }

  return {
    score: Math.min(100, score),
    reasons
  };
}

/**
 * Finds potential matching items from the database for a given item.
 * For a 'lost' item, it searches open 'found' items.
 * For a 'found' item, it searches open 'lost' items.
 */
function findMatches(targetItem, db, limit = 5, minScore = 30) {
  const oppositeType = targetItem.type === 'lost' ? 'found' : 'lost';

  const candidates = db.prepare(`
    SELECT id, type, title, category, description, location, date_occurred, status, image_url, created_at
    FROM items
    WHERE type = ? AND status = 'open' AND id != ?
    ORDER BY created_at DESC
  `).all(oppositeType, targetItem.id || 0);

  const scoredMatches = candidates
    .map(candidate => {
      const { score, reasons } = calculateScore(targetItem, candidate);
      return {
        item: candidate,
        matchScore: score,
        matchConfidence: score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low',
        matchReasons: reasons,
        isRuleBased: true
      };
    })
    .filter(match => match.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scoredMatches;
}

module.exports = {
  extractKeywords,
  calculateDateDifferenceDays,
  calculateScore,
  findMatches
};
