const {
  extractKeywords,
  calculateDateDifferenceDays,
  calculateScore,
  findMatches
} = require('../services/matchingService');
const { getDatabase } = require('../database/db');

describe('Rule-Based Matching Service', () => {
  let db;

  beforeAll(() => {
    db = getDatabase();
  });

  describe('Keyword Extraction and Stopword Filtering', () => {
    test('extracts clean lowercase alphanumeric keywords and filters out common stopwords', () => {
      const text = 'I lost my blue iPhone 13 in the cafeteria near table 4!';
      const keywords = extractKeywords(text);

      expect(keywords).toContain('blue');
      expect(keywords).toContain('iphone');
      expect(keywords).toContain('cafeteria');
      expect(keywords).toContain('table');
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('in');
      expect(keywords).not.toContain('my');
      expect(keywords).not.toContain('lost');
    });

    test('handles empty or null string gracefully', () => {
      expect(extractKeywords('')).toEqual([]);
      expect(extractKeywords(null)).toEqual([]);
    });
  });

  describe('Date Difference Calculation', () => {
    test('calculates correct days between two ISO date strings', () => {
      expect(calculateDateDifferenceDays('2026-10-01', '2026-10-03')).toBe(2);
      expect(calculateDateDifferenceDays('2026-10-05', '2026-10-05')).toBe(0);
      expect(calculateDateDifferenceDays('2026-09-20', '2026-10-01')).toBe(11);
    });
  });

  describe('Score Calculation Logic', () => {
    test('gives high score when category, location, date, and description keywords match', () => {
      const lostItem = {
        category: 'Electronics',
        location: 'Campus Library 2nd Floor',
        date_occurred: '2026-10-01',
        title: 'Black Dell Laptop',
        description: 'Black Dell XPS 15 laptop with carbon fiber palmrest'
      };

      const foundItem = {
        category: 'Electronics',
        location: 'Campus Library Study Desk',
        date_occurred: '2026-10-02',
        title: 'Dell Laptop Black',
        description: 'Found black Dell laptop on 2nd floor desk'
      };

      const result = calculateScore(lostItem, foundItem);
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.reasons.length).toBeGreaterThanOrEqual(3);
      expect(result.reasons.some(r => r.includes('category match'))).toBe(true);
    });

    test('gives low score when items belong to different categories and locations', () => {
      const lostItem = {
        category: 'Jewelry',
        location: 'Gym Locker Room',
        date_occurred: '2026-10-01',
        title: 'Gold Ring',
        description: 'Gold wedding band'
      };

      const foundItem = {
        category: 'Books & Stationery',
        location: 'Science Hall 101',
        date_occurred: '2026-05-01',
        title: 'Chemistry Textbook',
        description: 'Organic chemistry hardcover book'
      };

      const result = calculateScore(lostItem, foundItem);
      expect(result.score).toBe(0);
      expect(result.reasons.length).toBe(0);
    });
  });

  describe('Database Matching (findMatches)', () => {
    beforeAll(() => {
      // Seed a few items in test database
      db.prepare(`
        INSERT INTO items (type, title, category, description, location, date_occurred, status)
        VALUES 
          ('found', 'Sony Noise Canceling Headphones', 'Electronics', 'Black over-ear Sony WH-1000XM4 headphones', 'Student Union Cafe', '2026-10-02', 'open'),
          ('found', 'Blue Water Bottle', 'Other', 'Stainless steel blue hydro flask bottle', 'Gym Court 2', '2026-10-02', 'open'),
          ('lost', 'Sony WH-1000XM4 Black Headphones', 'Electronics', 'Lost my black Sony headphones in student union lounge', 'Student Union Cafe', '2026-10-02', 'open')
      `).run();
    });

    test('finds opposite-type items and returns scored suggestions', () => {
      const lostItem = {
        id: 9999,
        type: 'lost',
        title: 'Sony WH-1000XM4 Black Headphones',
        category: 'Electronics',
        description: 'Lost my black Sony headphones in student union lounge',
        location: 'Student Union Cafe',
        date_occurred: '2026-10-02'
      };

      const matches = findMatches(lostItem, db);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].item.type).toBe('found');
      expect(matches[0].item.title).toContain('Sony');
      expect(matches[0].matchScore).toBeGreaterThanOrEqual(50);
      expect(matches[0].isRuleBased).toBe(true);
    });
  });
});
