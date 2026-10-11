const request = require('supertest');
const app = require('../app');
const { getDatabase } = require('../database/db');

describe('Authentication API', () => {
  beforeAll(() => {
    const db = getDatabase();
    db.prepare('DELETE FROM claim_updates').run();
    db.prepare('DELETE FROM claims').run();
    db.prepare('DELETE FROM items').run();
    db.prepare('DELETE FROM users').run();
  });

  describe('POST /api/auth/register', () => {
    test('successfully registers a regular user with valid details', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'janedoe',
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('janedoe');
      expect(res.body.user.role).toBe('user');
      expect(res.body.token).toBeDefined();
    });

    test('rejects registration when email or username is already taken', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'janedoe',
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test('rejects admin registration when adminSecret is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'fakeadmin',
          email: 'fake@example.com',
          password: 'password123',
          role: 'admin',
          adminSecret: 'wrong_secret'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('allows admin registration when correct adminSecret is provided', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'realadmin',
          email: 'realadmin@example.com',
          password: 'password123',
          role: 'admin',
          adminSecret: 'admin_secret_lostfound_2026'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe('admin');
    });
  });

  describe('POST /api/auth/login', () => {
    test('successfully logs in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'jane@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    test('fails login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'jane@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
