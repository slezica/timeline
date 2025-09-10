import { test } from 'node:test'
import assert from 'node:assert'
import { createTestDb } from './test-db.js'

test('createTestDb - creates in-memory database with tables', async () => {
  const db = createTestDb()
  
  // Check status table exists and has initial migration
  const status = db.prepare('SELECT * FROM status').get()
  assert.ok(status)
  assert.strictEqual(status.migration, 1) // Should be at migration 1 after items table

  // Check items table exists with correct schema
  const tableInfo = db.prepare("PRAGMA table_info(items)").all()
  const columnNames = tableInfo.map(col => col.name)
  
  assert.ok(columnNames.includes('id'))
  assert.ok(columnNames.includes('kind'))
  assert.ok(columnNames.includes('title'))
  assert.ok(columnNames.includes('createdAt'))
  assert.ok(columnNames.includes('updatedAt'))

  db.close()
})

test('createTestDb - isolated instances', async () => {
  const db1 = createTestDb()
  const db2 = createTestDb()
  
  // Insert data in db1
  db1.prepare('INSERT INTO items (kind, title, createdAt, updatedAt) VALUES (?, ?, ?, ?)')
    .run('note', 'Test Note', '2023-01-01T00:00:00Z', '2023-01-01T00:00:00Z')
  
  // Check db1 has data, db2 doesn't
  const db1Count = db1.prepare('SELECT COUNT(*) as count FROM items').get().count
  const db2Count = db2.prepare('SELECT COUNT(*) as count FROM items').get().count
  
  assert.strictEqual(db1Count, 1)
  assert.strictEqual(db2Count, 0)

  db1.close()
  db2.close()
})