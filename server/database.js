import Database from 'better-sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dirname, 'db.sqlite3'))

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
    console.log('Running migration:', name)
    f()
    db.prepare('UPDATE status SET migration = ?').run(i)
  })()
}

export default db