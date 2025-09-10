import Database from 'better-sqlite3'

const migrations = [
  ["Create status table", (db) => {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        migration INTEGER NOT NULL
      )
    `).run()

    db.prepare(`
      INSERT INTO status (migration) VALUES(0)
    `).run()
  }],

  ["Create items table", (db) => {
    db.prepare(`
      CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT NOT NULL,
        title TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `).run()
  }],

  ["Create timestamps table and migrate data", (db) => {
    // Create timestamps table
    db.prepare(`
      CREATE TABLE timestamps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        kind TEXT NOT NULL,
        datetime TEXT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
      )
    `).run()

    // Create indexes for performance
    db.prepare(`CREATE INDEX idx_timestamps_item_kind ON timestamps (item_id, kind)`).run()
    db.prepare(`CREATE INDEX idx_timestamps_datetime ON timestamps (datetime)`).run()

    // Migrate existing data
    const items = db.prepare('SELECT id, createdAt, updatedAt FROM items').all()
    const insertTimestamp = db.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
    
    for (const item of items) {
      insertTimestamp.run(item.id, 'created', item.createdAt)
      insertTimestamp.run(item.id, 'updated', item.updatedAt)
    }

    // Drop timestamp columns from items table (modern SQLite supports this)
    db.prepare('ALTER TABLE items DROP COLUMN createdAt').run()
    db.prepare('ALTER TABLE items DROP COLUMN updatedAt').run()
  }]
]

export function createTestDb() {
  const db = new Database(':memory:')
  db.pragma('journal_mode = WAL')

  // Run migrations
  for (let i = 0; i < migrations.length; i++) {
    db.transaction(() => {
      const [name, f] = migrations[i]
      f(db)
      if (i > 0) { // Don't update for initial status table creation
        db.prepare('UPDATE status SET migration = ?').run(i)
      }
    })()
  }

  return db
}