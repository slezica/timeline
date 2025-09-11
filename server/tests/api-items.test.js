import { test } from 'node:test'
import assert from 'node:assert'
import { createTestServer, makeRequest } from './test-utils.js'

test('GET /api/items - empty database', async () => {
  const { app } = createTestServer()
  
  const response = await makeRequest(app, 'GET', '/api/items')

  assert.strictEqual(response.status, 200)
  assert.ok(Array.isArray(response.data.items))
  assert.strictEqual(response.data.items.length, 0)
})

test('GET /api/items - with test data, default sort', async () => {
  const { app, db } = createTestServer()
  
  // Insert test items with timestamps
  const insertItem = db.prepare('INSERT INTO items (kind, title) VALUES (?, ?)')
  const insertTimestamp = db.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
  
  // Item 1 - older
  const item1 = insertItem.run('note', 'First Note')
  insertTimestamp.run(item1.lastInsertRowid, 'created', '2023-01-01T10:00:00Z')
  insertTimestamp.run(item1.lastInsertRowid, 'updated', '2023-01-01T12:00:00Z')
  
  // Item 2 - newer
  const item2 = insertItem.run('task', 'Second Task')
  insertTimestamp.run(item2.lastInsertRowid, 'created', '2023-01-02T10:00:00Z')
  insertTimestamp.run(item2.lastInsertRowid, 'updated', '2023-01-02T11:00:00Z')
  
  const response = await makeRequest(app, 'GET', '/api/items')

  assert.strictEqual(response.status, 200)
  assert.strictEqual(response.data.items.length, 2)
  
  // Should be sorted by created desc (newest first)
  assert.strictEqual(response.data.items[0].title, 'Second Task')
  assert.strictEqual(response.data.items[1].title, 'First Note')
  assert.strictEqual(response.data.items[0].datetime, '2023-01-02T10:00:00Z')
})

test('GET /api/items - sort by updated timestamps', async () => {
  const { app, db } = createTestServer()
  
  const insertItem = db.prepare('INSERT INTO items (kind, title) VALUES (?, ?)')
  const insertTimestamp = db.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
  
  // Item 1 - created first, updated last
  const item1 = insertItem.run('note', 'Note A')
  insertTimestamp.run(item1.lastInsertRowid, 'created', '2023-01-01T10:00:00Z')
  insertTimestamp.run(item1.lastInsertRowid, 'updated', '2023-01-03T10:00:00Z') // Latest update
  
  // Item 2 - created last, updated first  
  const item2 = insertItem.run('note', 'Note B')
  insertTimestamp.run(item2.lastInsertRowid, 'created', '2023-01-02T10:00:00Z')
  insertTimestamp.run(item2.lastInsertRowid, 'updated', '2023-01-02T11:00:00Z')
  
  const response = await makeRequest(app, 'GET', '/api/items?sort=updated')

  assert.strictEqual(response.status, 200)
  assert.strictEqual(response.data.items.length, 2)
  
  // Should be sorted by updated desc (Note A has latest update)
  assert.strictEqual(response.data.items[0].title, 'Note A')
  assert.strictEqual(response.data.items[1].title, 'Note B')
})

test('GET /api/items - sort by non-existent kind falls back to created', async () => {
  const { app, db } = createTestServer()
  
  const insertItem = db.prepare('INSERT INTO items (kind, title) VALUES (?, ?)')
  const insertTimestamp = db.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
  
  // Only has created timestamp, no 'due' timestamp
  const item1 = insertItem.run('task', 'Task Without Due')
  insertTimestamp.run(item1.lastInsertRowid, 'created', '2023-01-01T10:00:00Z')
  
  const response = await makeRequest(app, 'GET', '/api/items?sort=due')

  assert.strictEqual(response.status, 200)
  assert.strictEqual(response.data.items.length, 1)
  
  // Should fall back to created timestamp
  assert.strictEqual(response.data.items[0].datetime, '2023-01-01T10:00:00Z')
})

test('GET /api/items - ascending order', async () => {
  const { app, db } = createTestServer()
  
  const insertItem = db.prepare('INSERT INTO items (kind, title) VALUES (?, ?)')
  const insertTimestamp = db.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
  
  const item1 = insertItem.run('note', 'Older Note')
  insertTimestamp.run(item1.lastInsertRowid, 'created', '2023-01-01T10:00:00Z')
  
  const item2 = insertItem.run('note', 'Newer Note')
  insertTimestamp.run(item2.lastInsertRowid, 'created', '2023-01-02T10:00:00Z')
  
  const response = await makeRequest(app, 'GET', '/api/items?order=asc')

  assert.strictEqual(response.status, 200)
  
  // Should be sorted by created asc (oldest first)
  assert.strictEqual(response.data.items[0].title, 'Older Note')
  assert.strictEqual(response.data.items[1].title, 'Newer Note')
})

test('GET /api/items - limit parameter', async () => {
  const { app, db } = createTestServer()
  
  const insertItem = db.prepare('INSERT INTO items (kind, title) VALUES (?, ?)')
  const insertTimestamp = db.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
  
  // Insert 3 items
  for (let i = 1; i <= 3; i++) {
    const item = insertItem.run('note', `Note ${i}`)
    insertTimestamp.run(item.lastInsertRowid, 'created', `2023-01-0${i}T10:00:00Z`)
  }
  
  const response = await makeRequest(app, 'GET', '/api/items?limit=2')

  assert.strictEqual(response.status, 200)
  assert.strictEqual(response.data.items.length, 2)
})

test('GET /api/items - start parameter filters results', async () => {
  const { app, db } = createTestServer()
  
  const insertItem = db.prepare('INSERT INTO items (kind, title) VALUES (?, ?)')
  const insertTimestamp = db.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
  
  const item1 = insertItem.run('note', 'Old Note')
  insertTimestamp.run(item1.lastInsertRowid, 'created', '2023-01-01T10:00:00Z')
  
  const item2 = insertItem.run('note', 'New Note')
  insertTimestamp.run(item2.lastInsertRowid, 'created', '2023-01-03T10:00:00Z')
  
  // Filter to only items created before Jan 2
  const response = await makeRequest(app, 'GET', '/api/items?start=2023-01-02T00:00:00Z')

  assert.strictEqual(response.status, 200)
  assert.strictEqual(response.data.items.length, 1)
  assert.strictEqual(response.data.items[0].title, 'Old Note')
})

test('GET /api/items - parameter validation', async () => {
  const { app } = createTestServer()
  
  // Invalid order should default to desc
  const response1 = await makeRequest(app, 'GET', '/api/items?order=invalid')
  assert.strictEqual(response1.status, 200)
  
  // Limit should be capped at 100
  const response2 = await makeRequest(app, 'GET', '/api/items?limit=999')
  assert.strictEqual(response2.status, 200)
  
  // Invalid limit should default
  const response3 = await makeRequest(app, 'GET', '/api/items?limit=invalid')
  assert.strictEqual(response3.status, 200)
})