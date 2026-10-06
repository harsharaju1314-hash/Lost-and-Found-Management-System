const app = require('./app');
const config = require('./config');
const { getDatabase } = require('./database/db');
const { seedData } = require('./database/seed');

// Initialize database
const db = getDatabase();

// Check if database has data; if empty, automatically seed
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  console.log('Database is empty. Running initial seed data...');
  seedData(db);
}

const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(` Lost & Found Management System API Server`);
  console.log(` Running on: http://localhost:${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` Database: ${config.databaseFile}`);
  console.log(`====================================================`);
});

module.exports = server;
