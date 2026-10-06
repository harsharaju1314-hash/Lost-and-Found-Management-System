const request = require('supertest');
const app = require('../src/app');
const { getDatabase } = require('../src/database/db');

describe('Claims Workflow and Tracking API', () => {
  let db;
  let testItemId;
  let adminToken;
  let userToken;
  let createdClaimCode;
  let createdClaimId;

  beforeAll(async () => {
    db = getDatabase();

    // Create admin user & get token
    const adminRes = await request(app).post('/api/auth/register').send({
      username: 'claimadmin',
      email: 'claimadmin@example.com',
      password: 'password123',
      role: 'admin',
      adminSecret: 'admin_secret_lostfound_2026'
    });
    adminToken = adminRes.body.token;

    // Create regular user & get token
    const userRes = await request(app).post('/api/auth/register').send({
      username: 'claimuser',
      email: 'claimuser@example.com',
      password: 'password123'
    });
    userToken = userRes.body.token;

    // Insert an item to claim directly in SQLite database
    const insertStmt = db.prepare(`
      INSERT INTO items (type, title, category, description, location, date_occurred, status, contact_name)
      VALUES (?, ?, ?, ?, ?, ?, 'open', ?)
    `);
    const insertRes = insertStmt.run(
      'found',
      'AirPods Pro Case',
      'Electronics',
      'Found white charging case with custom Pikachu engraving',
      'Student Union Lounge',
      '2026-10-05',
      'Campus Helpdesk'
    );
    testItemId = insertRes.lastInsertRowid;
  });

  describe('POST /api/items/:id/claims - Claim Submission', () => {
    test('successfully submits a claim with detailed verification proof', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/claims`)
        .send({
          claimant_name: 'John Claimant',
          claimant_email: 'claimant@example.com',
          claimant_phone: '555-0199',
          description_proof: 'The case has a small yellow Pikachu engraving on the front and a scratch on the hinge.',
          date_lost: '2026-10-05'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.claimCode).toMatch(/^CLM-[A-F0-9]{6}$/);
      expect(res.body.claim.status).toBe('pending');

      createdClaimCode = res.body.claimCode;
      createdClaimId = res.body.claim.id;
    });

    test('rejects claim submission with insufficient proof description (< 15 chars)', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/claims`)
        .send({
          claimant_name: 'John Claimant',
          claimant_email: 'claimant@example.com',
          description_proof: 'It is mine.'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details.some(d => d.includes('at least 15 characters'))).toBe(true);
    });
  });

  describe('GET /api/claims/track/:code - Claim Tracking by Code', () => {
    test('allows claimant to track status and view timeline using claim tracking code', async () => {
      const res = await request(app).get(`/api/claims/track/${createdClaimCode}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.claim.claim_code).toBe(createdClaimCode);
      expect(res.body.claim.status).toBe('pending');
      expect(Array.isArray(res.body.claim.history)).toBe(true);
      expect(res.body.claim.history.length).toBeGreaterThanOrEqual(1);
    });

    test('returns 404 for non-existent claim code', async () => {
      const res = await request(app).get('/api/claims/track/CLM-INVALID99');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/claims/:id - Admin Claim Review & Resolution', () => {
    test('prevents unauthenticated user from updating claim status (401)', async () => {
      const res = await request(app)
        .patch(`/api/claims/${createdClaimId}`)
        .send({ status: 'approved' });

      expect(res.statusCode).toBe(401);
    });

    test('prevents non-admin user from updating claim status (403)', async () => {
      const res = await request(app)
        .patch(`/api/claims/${createdClaimId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'approved' });

      expect(res.statusCode).toBe(403);
    });

    test('allows admin to approve claim with resolution notes and marks item as claimed', async () => {
      const res = await request(app)
        .patch(`/api/claims/${createdClaimId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
          admin_notes: 'Claimant verified engraving and serial number in person. Item handed over.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.claim.status).toBe('approved');
      expect(res.body.claim.admin_notes).toContain('Claimant verified');

      // Verify item status updated to 'claimed' in database
      const itemRes = await request(app).get(`/api/items/${testItemId}`);
      expect(itemRes.body.item.status).toBe('claimed');
    });
  });
});
