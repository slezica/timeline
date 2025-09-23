import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import PouchDB from 'pouchdb'
import { useStore } from '../store'


let testDb
let testDbCounter = 0


vi.mock('../database', () => {
  return {
    get db() {
      return testDb
    },
    initializeDb: vi.fn(async () => {
      let emit // shut up, linter

      // Create the index design document:
      await testDb.put({
        _id: '_design/index',
        views: {
          byDate: {
            map: function(doc) {
              if (doc.type != 'item') { return }
              emit(doc.createdDate, { event: 'created' })
              emit(doc.updatedDate, { event: 'updated' })
              if (doc.dueDate) { emit(doc.dueDate, { event: 'due' }) }
              if (doc.doneDate) { emit(doc.doneDate, { event: 'done' }) }
            }.toString()
          }
        }
      })

      // Create basic collections:
      await testDb.put({ _id: 'shelf', type: 'collection', refs: [] })
      await testDb.put({ _id: 'desk', type: 'collection', refs: [] })
    })
  }
})

// Mock utils:
vi.mock('../utils', async () => {
  const actual = await vi.importActual('../utils')
  return {
    ...actual,
    scheduled: (fn) => fn // Remove scheduling for tests
  }
})


describe('Store actions', () => {
  let store

  beforeEach(async () => {
    // Create a fresh database for each test:
    testDbCounter++
    testDb = new PouchDB(`test-db-${testDbCounter}`, { adapter: 'memory' })

    // Get fresh store instance:
    store = useStore.getState()

    // Initialize the store:
    await store.initialize()
  })

  afterEach(async () => {
    // Clean up database after each test:
    if (testDb) {
      await testDb.destroy()
    }
  })

  describe('saveItem', () => {
    it('should create a new item and store it', async () => {
      const newItem = {
        type: 'item',
        kind: 'task',
        title: 'Test Task',
        body: 'Test description',
        createdDate: new Date().toISOString(),
        refs: []
      }

      const result = await store.saveItem.run(newItem)

      // Verify the result:
      expect(result).toBeDefined()
      expect(result._id).toBeDefined()
      expect(result._rev).toBeDefined()
      expect(result.title).toBe('Test Task')

      // Verify it's actually stored:
      const storedItem = await testDb.get(result._id)
      expect(storedItem.title).toBe('Test Task')
      expect(storedItem.body).toBe('Test description')
      expect(storedItem.type).toBe('item')
      expect(storedItem.kind).toBe('task')
    })

    it('should update existing item', async () => {
      // First create an item:
      const newItem = {
        type: 'item',
        kind: 'note',
        title: 'Original Title',
        body: 'Original body',
        createdDate: new Date().toISOString(),
        refs: []
      }

      const created = await store.saveItem.run(newItem)

      // Verify it exists:
      const stored = await testDb.get(created._id)
      expect(stored.title).toBe('Original Title')

      // Now update it:
      const updated = await store.saveItem.run({
        ...created,
        title: 'Updated Title',
        body: 'Updated body'
      })

      // Verify the update:
      expect(updated._id).toBe(created._id)
      expect(updated._rev).not.toBe(created._rev)
      expect(updated.title).toBe('Updated Title')

      // Verify the update is persisted:
      const storedUpdated = await testDb.get(updated._id)
      expect(storedUpdated.title).toBe('Updated Title')
      expect(storedUpdated.body).toBe('Updated body')
      expect(storedUpdated._rev).toBe(updated._rev)
    })

    it('should work with database queries', async () => {
      const now = new Date().toISOString()

      // Create multiple items:
      const items = [
        { type: 'item', kind: 'task', title: 'Task 1', createdDate: now, refs: [] },
        { type: 'item', kind: 'note', title: 'Note 1', createdDate: now, refs: [] }
      ]

      await Promise.all(items.map(store.saveItem.run))

      // Query the database using the view:
      const queryResult = await testDb.query('index/byDate', {
        include_docs: true,
        key: now
      })

      expect(queryResult.rows).toHaveLength(2)
      expect(queryResult.rows[0].value.event).toBe('created')
      expect(queryResult.rows[0].doc.title).toMatch(/Task 1|Note 1/)
      expect(queryResult.rows[1].doc.title).toMatch(/Task 1|Note 1/)
    })

    it('should handle database conflicts properly', async () => {
      // Create an item:
      const newItem = {
        type: 'item',
        kind: 'task',
        title: 'Original',
        createdDate: new Date().toISOString(),
        refs: []
      }

      const created = await store.saveItem.run(newItem)

      // Simulate a conflict by modifying the doc directly:
      const doc = await testDb.get(created._id)
      doc.title = 'Modified directly'
      await testDb.put(doc)

      // Try to update using the old rev (should cause conflict):
      try {
        await testDb.put({ ...created, title: 'Should conflict' })
        expect.fail('Should have thrown a conflict error')

      } catch (error) {
        expect(error.name).toBe('conflict')
        expect(error.status).toBe(409)
      }
    })

    it('should handle database errors', async () => {
      // Mock the put method to simulate a database error:
      const originalPut = testDb.put
      testDb.put = vi.fn().mockRejectedValue(new Error('Connection failed'))

      const newItem = {
        type: 'item',
        kind: 'task',
        title: 'Should fail',
        createdDate: new Date().toISOString(),
        refs: []
      }

      // This should handle the error gracefully:
      await store.saveItem.run(newItem)

      // The store should have handled the error:
      const state = useStore.getState().saveItem
      expect(state.error).toBeDefined()

      // Restore original method:
      testDb.put = originalPut
    })
  })
})