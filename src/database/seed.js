const bcrypt = require('bcryptjs');
const { getDatabase } = require('./db');

function seedData(database) {
  const db = database || getDatabase();

  console.log('--- Seeding database with realistic sample data ---');

  // Clear existing records
  db.prepare('DELETE FROM claim_updates').run();
  db.prepare('DELETE FROM claims').run();
  db.prepare('DELETE FROM items').run();
  db.prepare('DELETE FROM users').run();

  // 1. Seed Users
  const passwordHashAdmin = bcrypt.hashSync('admin123', 10);
  const passwordHashUser = bcrypt.hashSync('user123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `);

  const adminResult = insertUser.run('admin', 'admin@lostfound.local', passwordHashAdmin, 'admin');
  const userResult = insertUser.run('johndoe', 'john.doe@example.com', passwordHashUser, 'user');
  const adminId = adminResult.lastInsertRowid;
  const userId = userResult.lastInsertRowid;

  // 2. Seed Items
  const insertItem = db.prepare(`
    INSERT INTO items (type, title, category, description, location, date_occurred, status, image_url, contact_name, contact_email, contact_phone, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Today and recent dates
  const today = new Date().toISOString().split('T')[0];
  const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  const item1 = insertItem.run(
    'lost',
    'Black Leather Wallet',
    'Wallets & Bags',
    'Lost a black bifold leather wallet with driver license, student card, and credit cards.',
    'Central Library 2nd Floor Study Room',
    daysAgo(2),
    'open',
    null,
    'John Doe',
    'john.doe@example.com',
    '555-0199',
    userId
  );

  const item2 = insertItem.run(
    'found',
    'Black Bifold Leather Wallet',
    'Wallets & Bags',
    'Found a black leather wallet on a study desk. Turned in to 2nd floor desk.',
    'Central Library 2nd Floor Desk',
    daysAgo(1),
    'open',
    null,
    'Library Staff',
    'staff@library.local',
    '555-0100',
    null
  );

  const item3 = insertItem.run(
    'lost',
    'Apple iPhone 13 (Navy Blue Case)',
    'Electronics',
    'Lost navy blue iPhone 13 with a slight scratch on top corner and mountain lockscreen.',
    'Campus Cafeteria Table 4',
    daysAgo(3),
    'open',
    null,
    'Alice Smith',
    'alice.smith@example.com',
    '555-0144',
    null
  );

  const item4 = insertItem.run(
    'found',
    'iPhone with Blue Protective Case',
    'Electronics',
    'Found on a dining chair after lunch hours. Kept in safe storage at Cafeteria office.',
    'Campus Cafeteria Main Hall',
    daysAgo(3),
    'open',
    null,
    'Cafeteria Manager',
    'cafeteria@campus.local',
    '555-0150',
    null
  );

  const item5 = insertItem.run(
    'lost',
    'Set of 3 Keys with Red Toyota Fob',
    'Keys & Badges',
    'Dorm key, mail key, and car key with red Toyota fob and small flashlight keychain.',
    'Science Complex Hallway A',
    daysAgo(5),
    'open',
    null,
    'David Miller',
    'dmiller@example.com',
    '555-0177',
    null
  );

  const item6 = insertItem.run(
    'found',
    'Set of Keys with Red Lanyard and Fob',
    'Keys & Badges',
    'Found set of keys near the vending machines at Science building entrance.',
    'Science Complex Entrance',
    daysAgo(4),
    'open',
    null,
    'Campus Security',
    'security@campus.local',
    '555-0111',
    null
  );

  const item7 = insertItem.run(
    'found',
    'Teal Hydro Flask 32oz Water Bottle',
    'Other',
    'Teal colored water bottle with several outdoor national park stickers.',
    'Recreation Center Gym 1',
    daysAgo(7),
    'claimed',
    null,
    'Gym Desk',
    'reccenter@campus.local',
    '555-0122',
    null
  );

  const item8 = insertItem.run(
    'lost',
    'Ray-Ban Aviator Sunglasses (Gold Frame)',
    'Clothing & Accessories',
    'Gold framed Ray-Ban sunglasses in a brown leather case. Left on bus stop bench.',
    'Bus Stop 14 North Gate',
    daysAgo(1),
    'open',
    null,
    'Sarah Jenkins',
    'sarah.j@example.com',
    '555-0188',
    null
  );

  // 3. Seed Claims
  const insertClaim = db.prepare(`
    INSERT INTO claims (claim_code, item_id, claimant_name, claimant_email, claimant_phone, description_proof, date_lost, status, admin_notes, reviewed_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertUpdate = db.prepare(`
    INSERT INTO claim_updates (claim_id, previous_status, new_status, note, updated_by)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Sample Claim 1: Approved claim on Hydro Flask
  const claim1Result = insertClaim.run(
    'CLM-9021A4',
    item7.lastInsertRowid,
    'Emma Watson',
    'emma.w@example.com',
    '555-0133',
    'My bottle has 3 stickers: Yosemite, Yellowstone, and a small pine tree sticker on the bottom base.',
    daysAgo(7),
    'approved',
    'Sticker descriptions and bottle color matched exactly. Item returned to owner.',
    adminId
  );

  insertUpdate.run(
    claim1Result.lastInsertRowid,
    'pending',
    'approved',
    'Verified sticker details with front desk inventory. Item handed over to claimant.',
    'Admin (reviewer)'
  );

  // Sample Claim 2: Pending claim on Found Wallet
  const claim2Result = insertClaim.run(
    'CLM-4482B7',
    item2.lastInsertRowid,
    'John Doe',
    'john.doe@example.com',
    '555-0199',
    'The wallet is black Fossil leather bifold. Inside there is a State DL in name of John Doe and a library card.',
    daysAgo(2),
    'pending',
    null,
    null
  );

  insertUpdate.run(
    claim2Result.lastInsertRowid,
    'none',
    'pending',
    'Claim submitted by claimant. Awaiting reviewer verification.',
    'System'
  );

  console.log('--- Database seeding completed successfully ---');
  console.log(`Admin user: admin@lostfound.local / admin123`);
  console.log(`Regular user: john.doe@example.com / user123`);
  console.log(`Sample items created: 8 items, 2 claims`);
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
