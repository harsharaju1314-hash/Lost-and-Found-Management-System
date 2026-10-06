const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { getDatabase } = require('../database/db');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

function register(req, res, next) {
  try {
    const { username, email, password, role, adminSecret } = req.body;
    const db = getDatabase();

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    // Check existing
    const existing = db.prepare('SELECT id, username, email FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A user with this username or email already exists.'
      });
    }

    // Determine role (admin role requires correct admin secret)
    let assignedRole = 'user';
    if (role === 'admin') {
      if (adminSecret === config.adminSecretKey) {
        assignedRole = 'admin';
      } else {
        return res.status(403).json({
          success: false,
          error: 'Invalid administrator registration secret key.'
        });
      }
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run(username.trim(), email.trim().toLowerCase(), passwordHash, assignedRole);

    const newUser = {
      id: result.lastInsertRowid,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      role: assignedRole
    };

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: newUser,
      token
    });
  } catch (err) {
    next(err);
  }
}

function login(req, res, next) {
  try {
    const { identifier, password } = req.body;
    const db = getDatabase();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email/username and password are required.'
      });
    }

    const user = db.prepare(`
      SELECT id, username, email, password_hash, role, created_at
      FROM users
      WHERE email = ? OR username = ?
    `).get(identifier.trim().toLowerCase(), identifier.trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Incorrect password.'
      });
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: 'Login successful.',
      user: safeUser,
      token
    });
  } catch (err) {
    next(err);
  }
}

function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const db = getDatabase();
  const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User profile not found' });
  }

  res.json({
    success: true,
    user
  });
}

module.exports = {
  register,
  login,
  getMe
};
