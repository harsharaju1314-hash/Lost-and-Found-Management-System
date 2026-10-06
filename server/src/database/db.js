const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const config = require('../config');

let dbInstance = null;

function getDatabase(customPath) {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const dbPath = customPath || (config.nodeEnv === 'test' ? (process.env.TEST_DB || ':memory:') : config.databaseFile);
  
  // Ensure directory exists if not in-memory
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  // Initialize schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  if (!customPath) {
    dbInstance = db;
  }

  return db;
}

function resetTestDatabase() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (e) {
      // ignore
    }
    dbInstance = null;
  }
  return getDatabase();
}

module.exports = {
  getDatabase,
  resetTestDatabase
};
