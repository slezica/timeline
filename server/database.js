import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const db = new Database(join(__dirname, 'db.sqlite3'))

db.pragma('journal_mode = WAL')

const migrations = [
  ["Create status table", () => {
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

  ["Create items table", () => {
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

  ["Create timestamps table and migrate data", () => {
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
  }],

  ["Create items_task table", () => {
    db.prepare(`
      CREATE TABLE items_task (
        itemId INTEGER PRIMARY KEY,
        dueDate TEXT,
        doneDate TEXT,
        FOREIGN KEY (itemId) REFERENCES items (id) ON DELETE CASCADE
      )
    `).run()
    
    // Create index for due date queries
    db.prepare(`CREATE INDEX idx_items_task_due_date ON items_task (dueDate)`).run()
    db.prepare(`CREATE INDEX idx_items_task_done ON items_task (doneDate)`).run()
  }]
]

let initialStatus
try {
  initialStatus = db.prepare('SELECT * FROM status').get()
} catch {
  initialStatus = { migration: -1 }
}

for (let i = initialStatus.migration + 1; i < migrations.length; i++) {
  db.transaction(() => {
    const [ name, f ] = migrations[i]
    console.log('[db] migrations:', name)
    f()
    db.prepare('UPDATE status SET migration = ?').run(i)
  })()
}

console.log('[db] migrations: done')
