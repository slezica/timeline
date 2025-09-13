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
  }],

  ["Create date indexing table and triggers", () => {
    db.prepare(`
      CREATE TABLE dates (
        itemId INTEGER NOT NULL,
        kind TEXT NOT NULL,
        date TEXT NOT NULL,

        PRIMARY KEY (itemId, kind),
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
        CHECK (date GLOB '${DATE_GLOB}')
      )
    `).run()

    db.prepare(`CREATE INDEX datesDate ON dates (date)`).run()

    db.prepare(`
      CREATE TRIGGER itemOi AFTER INSERT ON items BEGIN
        INSERT INTO dates(itemId, kind, date) VALUES (new.id, 'created', new.createdDate);
        INSERT INTO dates(itemId, kind, date) VALUES (new.id, 'updated', new.updatedDate);
      END
    `).run()

    db.prepare(`
      CREATE TRIGGER itemCreatedOu AFTER UPDATE OF createdDate ON items BEGIN
        INSERT OR REPLACE INTO dates(itemId, kind, date) VALUES (new.id, 'created', new.createdDate);
      END
    `).run()

    db.prepare(`
      CREATE TRIGGER itemUpdatedOu AFTER UPDATE OF updatedDate ON items BEGIN
        INSERT OR REPLACE INTO dates(itemId, kind, date) VALUES (new.id, 'updated', new.updatedDate);
      END
    `).run()

  }],

  ["Create task tables and triggers", () => {
    db.prepare(`
      CREATE TABLE taskItems (
        itemId INTEGER PRIMARY KEY,
        dueDate TEXT,
        doneDate TEXT,

        FOREIGN KEY (itemId) REFERENCES items (id) ON DELETE CASCADE,
        CHECK (dueDate IS NULL OR dueDate GLOB '${DATE_GLOB}'),
        CHECK (doneDate IS NULL or doneDate GLOB '${DATE_GLOB}')
      )
    `).run()
    
    // Index dueDate when taskItems are created:
    db.prepare(`
      CREATE TRIGGER itemTaskDueOi AFTER INSERT ON taskItems WHEN new.dueDate IS NOT NULL BEGIN
        INSERT INTO dates(itemId, kind, date) VALUES (new.itemId, 'due', new.dueDate);
      END
    `).run()

    // Update indexed dueDate when updated (non-null):
    db.prepare(`
      CREATE TRIGGER itemsTaskDueOuNotNull AFTER UPDATE OF dueDate ON taskItems WHEN new.dueDate IS NOT NULL BEGIN
        INSERT OR REPLACE INTO dates(itemId, kind, date) VALUES (new.itemId, 'due', new.dueDate);
      END
    `).run()

    // Delete indexed dueDate when updated (null):
    db.prepare(`
      CREATE TRIGGER itemsTaskDueOuNull AFTER UPDATE OF dueDate ON taskItems WHEN new.dueDate IS NULL BEGIN
        DELETE FROM dates WHERE itemId=new.itemId and kind='due';
      END
    `).run()

    // Index doneDate when taskItems are created:
    db.prepare(`
      CREATE TRIGGER itemTaskDoneOi AFTER INSERT ON taskItems WHEN new.doneDate IS NOT NULL BEGIN
        INSERT INTO dates(itemId, kind, date) VALUES (new.itemId, 'done', new.doneDate);
      END
    `).run()

    // Update indexed doneDate when updated (non-null):
    db.prepare(`
      CREATE TRIGGER itemsTaskDoneOuNotNull AFTER UPDATE OF doneDate ON taskItems WHEN new.doneDate IS NOT NULL BEGIN
        INSERT OR REPLACE INTO dates(itemId, kind, date) VALUES (new.itemId, 'done', new.doneDate);
      END
    `).run()

    // Delete indexed doneDate when updated (null):
    db.prepare(`
      CREATE TRIGGER itemsTaskDoneOuNull AFTER UPDATE OF doneDate ON taskItems WHEN new.doneDate IS NULL BEGIN
        DELETE FROM dates WHERE itemId=new.itemId and kind='done';
      END
    `).run()
  }],
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
