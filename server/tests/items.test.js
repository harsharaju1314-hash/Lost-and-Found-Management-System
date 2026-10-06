const request = require('supertest');
const app = require('../src/app');
const { getDatabase } = require('../src/database/db');

describe('Items API Endpoints', () => {
  let db;

  beforeAll(() => {
    db = getDatabase();
    db.prepare('DELETE FROM claim_updates').run();
    db.prepare('DELETE FROM claims').run();
    db.prepare('DELETE FROM items').run();
  });

  describe('POST /api/items - Report Lost / Found Item', () => {
    test('successfully creates a lost item with valid fields', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({
          type: 'lost',
          title: 'MacBook Pro 14 M2',
          category: 'Electronics',
          description: 'Silver MacBook Pro left on 3rd floor study desk',
          location: 'Main Library 3rd Floor',
          date_occurred: '2026-10-04',
          contact_name: 'Alex Brown',
          contact_email: 'alex@example.com'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.item.id).toBeDefined();
      expect(res.body.item.title).toBe('MacBook Pro 14 M2');
      expect(res.body.item.status).toBe('open');
      expect(Array.isArray(res.body.potentialMatches)).toBe(true);
    });

    test('successfully creates a found item with valid fields', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({
          type: 'found',
          title: 'Silver Apple Laptop',
          category: 'Electronics',
          description: 'Found a silver 14 inch Apple laptop near quiet study desks',
          location: 'Main Library Study Area',
          date_occurred: '2026-10-04',
          contact_name: 'Library Staff'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.item.type).toBe('found');
    });

    test('rejects creation with missing required fields (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({
          title: 'No Category Item'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toBeDefined();
    });

    test('rejects invalid category value', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({
          type: 'lost',
          title: 'Gold Watch',
          category: 'InvalidCategoryName',
          description: 'Lost expensive watch',
          location: 'Gym',
          date_occurred: '2026-10-04'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.details.some(d => d.includes('Category must be one of'))).toBe(true);
    });
  });

  describe('GET /api/items - Search and Filtering', () => {
    test('retrieves all items with pagination metadata', async () => {
      const res = await request(app).get('/api/items');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(2);
    });

    test('filters items by keyword search', async () => {
      const res = await request(app).get('/api/items?q=MacBook');

      expect(res.statusCode).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);
      expect(res.body.items[0].title).toContain('MacBook');
    });

    test('filters items by category and type', async () => {
      const res = await request(app).get('/api/items?category=Electronics&type=found');

      expect(res.statusCode).toBe(200);
      expect(res.body.items.every(i => i.category === 'Electronics' && i.type === 'found')).toBe(true);
    });
  });

  describe('GET /api/items/:id - Item Details & Match Suggestions', () => {
    test('returns item details and rule-based suggestions', async () => {
      const listRes = await request(app).get('/api/items?limit=1');
      const itemId = listRes.body.items[0].id;

      const res = await request(app).get(`/api/items/${itemId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.item.id).toBe(itemId);
      expect(Array.isArray(res.body.potentialMatches)).toBe(true);
    });

    test('returns 404 for non-existent item id', async () => {
      const res = await request(app).get('/api/items/999999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
