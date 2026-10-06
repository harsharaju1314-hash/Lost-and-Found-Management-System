require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_lost_found_system_key_123',
  adminSecretKey: process.env.ADMIN_SECRET_KEY || 'admin_secret_lostfound_2026',
  databaseFile: process.env.DATABASE_FILE || path.join(__dirname, '../../database.sqlite'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  uploadDir: path.join(__dirname, '../../uploads')
};
