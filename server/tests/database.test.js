import { test } from 'node:test'
import assert from 'node:assert'
import { createTestDb } from './test-db.js'

test('createTestDb - creates in-memory database with tables', async () => {
  const db = createTestDb()
  
  // Check status table exists and has final migration
  const status = db.prepare('SELECT * FROM status').get()
  assert.ok(status)
  assert.strictEqual(status.migration, 2) // Should be at migration 2 after all migrations

  // Check items table exists with correct final schema (no timestamp columns)
  const itemsInfo = db.prepare("PRAGMA table_info(items)").all()
  const itemsColumns = itemsInfo.map(col => col.name)
  
  assert.ok(itemsColumns.includes('id'))
  assert.ok(itemsColumns.includes('kind'))
  assert.ok(itemsColumns.includes('title'))
  assert.ok(!itemsColumns.includes('createdAt')) // Should be removed
  assert.ok(!itemsColumns.includes('updatedAt')) // Should be removed

  // Check timestamps table exists with correct schema
  const timestampsInfo = db.prepare("PRAGMA table_info(timestamps)").all()
  const timestampsColumns = timestampsInfo.map(col => col.name)
  
  assert.ok(timestampsColumns.includes('id'))
  assert.ok(timestampsColumns.includes('item_id'))
  assert.ok(timestampsColumns.includes('kind'))
  assert.ok(timestampsColumns.includes('datetime'))

  db.close()
})

test('createTestDb - isolated instances', async () => {
  const db1 = createTestDb()
  const db2 = createTestDb()
  
  // Insert data in db1 with timestamps
  const insertItem = db1.prepare('INSERT INTO items (kind, title) VALUES (?, ?)')
  const insertTimestamp = db1.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
  
  const result = insertItem.run('note', 'Test Note')
  const itemId = result.lastInsertRowid
  insertTimestamp.run(itemId, 'created', '2023-01-01T00:00:00Z')
  insertTimestamp.run(itemId, 'updated', '2023-01-01T00:00:00Z')
  
  // Check db1 has data, db2 doesn't
  const db1ItemCount = db1.prepare('SELECT COUNT(*) as count FROM items').get().count
  const db2ItemCount = db2.prepare('SELECT COUNT(*) as count FROM items').get().count
  const db1TimestampCount = db1.prepare('SELECT COUNT(*) as count FROM timestamps').get().count
  const db2TimestampCount = db2.prepare('SELECT COUNT(*) as count FROM timestamps').get().count
  
  assert.strictEqual(db1ItemCount, 1)
  assert.strictEqual(db2ItemCount, 0)
  assert.strictEqual(db1TimestampCount, 2) // created + updated
  assert.strictEqual(db2TimestampCount, 0)

  db1.close()
  db2.close()
})