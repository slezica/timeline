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


// Test helper to create items with default values:
const createItem = (overrides = {}) => ({
  type: 'item',
  kind: 'task',
  title: 'Test Task',
  createdDate: new Date().toISOString(),
  refs: [],
  ...overrides
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
      const newItem = createItem({ body: 'Test description' })

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
      const newItem = createItem({
        title: 'Original Title',
        body: 'Original body'
      })

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
        createItem({ title: 'Task 1', createdDate: now }),
        createItem({ kind: 'note', title: 'Note 1', createdDate: now })
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
      const newItem = createItem({ title: 'Original' })

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

      const newItem = createItem({ title: 'Should fail' })

      // This should handle the error gracefully:
      await store.saveItem.run(newItem)

      // The store should have handled the error:
      const state = useStore.getState().saveItem
      expect(state.error).toBeDefined()

      // Restore original method:
      testDb.put = originalPut
    })
  })

  describe('deleteItem', () => {
    it('should mark item as deleted and store it', async () => {
      // First create an item:
      const newItem = createItem()

      const created = await store.saveItem.run(newItem)

      // Then delete it:
      const deleted = await store.deleteItem.run(created)

      // Verify the result:
      expect(deleted).toBeDefined()
      expect(deleted._id).toBe(created._id)
      expect(deleted._rev).not.toBe(created._rev)
      expect(deleted.deleted).toBe(true)

      // Verify it's actually stored with deleted flag:
      const storedItem = await testDb.get(deleted._id)
      expect(storedItem.deleted).toBe(true)
      expect(storedItem._rev).toBe(deleted._rev)
    })

    it('should handle deleting already deleted item', async () => {
      // Create and delete an item:
      const newItem = createItem()

      const created = await store.saveItem.run(newItem)
      const deleted = await store.deleteItem.run(created)

      // Delete it again:
      const deletedAgain = await store.deleteItem.run(deleted)

      // Verify the result:
      expect(deletedAgain._id).toBe(deleted._id)
      expect(deletedAgain._rev).not.toBe(deleted._rev)
      expect(deletedAgain.deleted).toBe(true)
    })

    it('should handle database errors during deletion', async () => {
      // Create an item first:
      const newItem = createItem()

      const created = await store.saveItem.run(newItem)

      // Mock the put method to simulate a database error:
      const originalPut = testDb.put
      testDb.put = vi.fn().mockRejectedValue(new Error('Database error'))

      // Try to delete:
      await store.deleteItem.run(created)

      // The store should have handled the error:
      const state = useStore.getState().deleteItem
      expect(state.loading).toBe(false)
      expect(state.error).toBeDefined()
      expect(state.result).toBe(null)

      // Restore original method:
      testDb.put = originalPut
    })

    it('should return updated item', async () => {
      const newItem = createItem()

      const created = await store.saveItem.run(newItem)
      const deleted = await store.deleteItem.run(created)

      expect(deleted).toBeDefined()
      expect(deleted._id).toBeDefined()
      expect(deleted._rev).toBeDefined()
      expect(deleted.deleted).toBe(true)
    })
  })

  describe('replaceCollection', () => {
    it('should update collection refs in store and database', async () => {
      const newRefs = [
        { id: 'item1', kind: 'task', event: 'created', date: '2023-01-01' },
        { id: 'item2', kind: 'note', event: 'created', date: '2023-01-02' }
      ]

      await store.shelf.replace(newRefs)

      // Verify store state is updated:
      const shelfState = useStore.getState().shelf
      expect(shelfState.refs).toEqual(newRefs)

      // Verify database is updated:
      const shelfDoc = await testDb.get('shelf')
      expect(shelfDoc.refs).toEqual(newRefs)
      expect(shelfDoc.type).toBe('collection')
    })

    it('should handle empty refs array', async () => {
      const emptyRefs = []

      await store.desk.replace(emptyRefs)

      // Verify store state:
      const deskState = useStore.getState().desk
      expect(deskState.refs).toEqual([])

      // Verify database:
      const deskDoc = await testDb.get('desk')
      expect(deskDoc.refs).toEqual([])
    })

    it('should preserve collection document properties', async () => {
      const newRefs = [{ id: 'test', kind: 'task', event: 'created', date: '2023-01-01' }]

      await store.shelf.replace(newRefs)

      const shelfDoc = await testDb.get('shelf')
      expect(shelfDoc._id).toBe('shelf')
      expect(shelfDoc.type).toBe('collection')
      expect(shelfDoc._rev).toBeDefined()
      expect(shelfDoc.refs).toEqual(newRefs)
    })

    it('should handle database errors during replacement', async () => {
      // Mock testDb.get to simulate error:
      const originalGet = testDb.get
      testDb.get = vi.fn().mockRejectedValue(new Error('Database error'))

      const newRefs = [{ id: 'test', kind: 'task', event: 'created', date: '2023-01-01' }]

      // This should throw since replaceCollection doesn't have error handling:
      await expect(store.shelf.replace(newRefs)).rejects.toThrow('Database error')

      // Restore original method:
      testDb.get = originalGet
    })
  })
})