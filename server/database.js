import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const DATE_GLOB = '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const db = new Database(join(__dirname, 'db.sqlite3'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const migrations = [
  // Each migration will run exactly once (see runner below).
  // If a database was already initialized, this fails quickly on the 1st migration. 

  ["Create status table", () => {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        migration INTEGER NOT NULL
      )
    `).run()

    db.prepare(`
      INSERT INTO status (id, migration) VALUES(1, 0)
    `).run()
  }],

  ["Create items table", () => {
    db.prepare(`
      CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT NOT NULL,
        title TEXT NOT NULL,
        createdDate TEXT NOT NULL,
        updatedDate TEXT NOT NULL,

        CHECK (createdDate GLOB '${DATE_GLOB}'),
        CHECK (updatedDate GLOB '${DATE_GLOB}')
      )
    `).run()

    db.prepare(`CREATE INDEX itemsKind ON items (kind)`).run()
    db.prepare(`CREATE INDEX itemsCreated ON items (createdDate)`).run()
    db.prepare(`CREATE INDEX itemsUpdated ON items (updatedDate)`).run()
  }],

  ["Create task tables", () => {
    db.prepare(`
      CREATE TABLE taskItems (
        itemId INTEGER PRIMARY KEY,
        dueDate TEXT,
        doneDate TEXT,

        FOREIGN KEY (itemId) REFERENCES items (id) ON DELETE CASCADE,
        CHECK (dueDate IS NULL OR dueDate GLOB '${DATE_GLOB}'),
        CHECK (doneDate IS NULL OR doneDate GLOB '${DATE_GLOB}')
      )
    `).run()
    
    db.prepare(`CREATE INDEX taskItemsDue ON taskItems (dueDate)`).run()
    db.prepare(`CREATE INDEX taskItemsDone ON taskItems (doneDate)`).run()
  }],

  ["Create dates view", () => {
    db.prepare(`
      CREATE VIEW dates AS
        SELECT id AS itemId, 'created' AS kind, createdDate AS date FROM items
        UNION ALL
        SELECT id, 'updated', updatedDate FROM items
        UNION ALL
        SELECT itemId, 'due',  dueDate  FROM taskItems WHERE dueDate IS NOT NULL
        UNION ALL
        SELECT itemId, 'done', doneDate FROM taskItems WHERE doneDate IS NOT NULL
    `).run()
  }]
]

let initialStatus
try {
  initialStatus = db.prepare('SELECT * FROM status WHERE id=1').get()
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
