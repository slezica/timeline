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