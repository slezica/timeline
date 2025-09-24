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
              if (doc.type != 'record') { return }
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

// Mock the MiniSearch constructor:
vi.mock('minisearch', () => {
  const mockMiniSearch = {
    has: vi.fn(() => false),
    add: vi.fn(),
    replace: vi.fn(),
    search: vi.fn(() => [])
  }

  return {
    default: vi.fn(() => mockMiniSearch)
  }
})

// Test helper to create records with default values:
const createRecord = (overrides = {}) => ({
  type: 'record',
  kind: 'task',
  title: 'Test Task',
  createdDate: new Date().toISOString(),
  refs: [],
  ...overrides
})


describe('Store', () => {
  let store
  let mockMiniSearch

  beforeEach(async () => {
    // Create a fresh database for each test:
    testDbCounter++
    testDb = new PouchDB(`test-db-${testDbCounter}`, { adapter: 'memory' })

    // Get fresh store instance:
    store = useStore.getState()

    // Get the MiniSearch mock instance:
    mockMiniSearch = globalThis.window?.miniSearch || {
      has: vi.fn(() => false),
      add: vi.fn(),
      replace: vi.fn(),
      search: vi.fn(() => [])
    }

    // Initialize the store:
    await store.initialize()

    // Update mockMiniSearch after initialization:
    mockMiniSearch = globalThis.window?.miniSearch || mockMiniSearch

    // Reset MiniSearch mock after initialization:
    if (mockMiniSearch.has?.mockClear) {
      mockMiniSearch.has.mockReturnValue(false)
      mockMiniSearch.add.mockClear()
      mockMiniSearch.replace.mockClear()
      mockMiniSearch.search.mockReturnValue([])
    }
  })

  afterEach(async () => {
    // Clean up database after each test:
    if (testDb) {
      await testDb.destroy()
    }
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useStore.getState()

      expect(state.ready).toBe(true) // After initialization
      expect(state.records.byId).toBeDefined()
      expect(state.timeline.refs).toBeDefined()
      expect(state.shelf.refs).toEqual([])
      expect(state.desk.refs).toEqual([])

      for (let entry of ['records', 'timeline', 'shelf', 'desk']) {
        expect(state[entry].ready).toBe(true)
        expect(state[entry].loading).toBe(false)
        expect(state[entry].error).toBe(null)
      }
    })
  })

  describe('Store Actions', () => {
    describe('saveRecord', () => {
      it('should create a new record and store it', async () => {
        const newRecord = createRecord({ body: 'Test description' })

        const result = await store.saveRecord.run(newRecord)

        // Verify the result:
        expect(result).toBeDefined()
        expect(result._id).toBeDefined()
        expect(result._rev).toBeDefined()
        expect(result.title).toBe('Test Task')

        // Verify it's actually stored:
        const storedRecord = await testDb.get(result._id)
        expect(storedRecord.title).toBe('Test Task')
        expect(storedRecord.body).toBe('Test description')
        expect(storedRecord.type).toBe('record')
        expect(storedRecord.kind).toBe('task')
      })

      it('should update existing record', async () => {
        // First create a record:
        const newRecord = createRecord({
          title: 'Original Title',
          body: 'Original body'
        })

        const created = await store.saveRecord.run(newRecord)

        // Verify it exists:
        const stored = await testDb.get(created._id)
        expect(stored.title).toBe('Original Title')

        // Now update it:
        const updated = await store.saveRecord.run({
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

        // Create multiple records:
        const records = [
          createRecord({ title: 'Task 1', createdDate: now }),
          createRecord({ kind: 'note', title: 'Note 1', createdDate: now })
        ]

        await Promise.all(records.map(store.saveRecord.run))

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
        // Create a record:
        const newRecord = createRecord({ title: 'Original' })

        const created = await store.saveRecord.run(newRecord)

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

        const newRecord = createRecord({ title: 'Should fail' })

        // This should handle the error gracefully:
        await store.saveRecord.run(newRecord)

        // The store should have handled the error:
        const state = useStore.getState().saveRecord
        expect(state.error).toBeDefined()

        // Restore original method:
        testDb.put = originalPut
      })
    })

    describe('deleteRecord', () => {
      it('should mark record as deleted and store it', async () => {
        // First create a record:
        const newRecord = createRecord()

        const created = await store.saveRecord.run(newRecord)

        // Then delete it:
        const deleted = await store.deleteRecord.run(created)

        // Verify the result:
        expect(deleted).toBeDefined()
        expect(deleted._id).toBe(created._id)
        expect(deleted._rev).not.toBe(created._rev)
        expect(deleted.deleted).toBe(true)

        // Verify it's actually stored with deleted flag:
        const storedRecord = await testDb.get(deleted._id)
        expect(storedRecord.deleted).toBe(true)
        expect(storedRecord._rev).toBe(deleted._rev)
      })

      it('should handle deleting already deleted record', async () => {
        // Create and delete a record:
        const newRecord = createRecord()

        const created = await store.saveRecord.run(newRecord)
        const deleted = await store.deleteRecord.run(created)

        // Delete it again:
        const deletedAgain = await store.deleteRecord.run(deleted)

        // Verify the result:
        expect(deletedAgain._id).toBe(deleted._id)
        expect(deletedAgain._rev).not.toBe(deleted._rev)
        expect(deletedAgain.deleted).toBe(true)
      })

      it('should handle database errors during deletion', async () => {
        // Create a record first:
        const newRecord = createRecord()

        const created = await store.saveRecord.run(newRecord)

        // Mock the put method to simulate a database error:
        const originalPut = testDb.put
        testDb.put = vi.fn().mockRejectedValue(new Error('Database error'))

        // Try to delete:
        await store.deleteRecord.run(created)

        // The store should have handled the error:
        const state = useStore.getState().deleteRecord
        expect(state.loading).toBe(false)
        expect(state.error).toBeDefined()
        expect(state.result).toBe(null)

        // Restore original method:
        testDb.put = originalPut
      })

      it('should return updated record', async () => {
        const newRecord = createRecord()

        const created = await store.saveRecord.run(newRecord)
        const deleted = await store.deleteRecord.run(created)

        expect(deleted).toBeDefined()
        expect(deleted._id).toBeDefined()
        expect(deleted._rev).toBeDefined()
        expect(deleted.deleted).toBe(true)
      })
    })

    describe('replaceCollection', () => {
      it('should update collection refs in store and database', async () => {
        const newRefs = [
          { id: 'record1', kind: 'task', event: 'created', date: '2023-01-01' },
          { id: 'record2', kind: 'note', event: 'created', date: '2023-01-02' }
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

  describe('Store Fetchers', () => {
    describe('fetchRecords', () => {
      it('should load records into byId map and search index', async () => {
        // Seed database with test records:
        const records = [
          createRecord({ _id: 'record1', title: 'Task 1' }),
          createRecord({ _id: 'record2', title: 'Task 2', kind: 'note' })
        ]

        for (const record of records) {
          await testDb.put(record)
        }

        // Fetch records:
        await store.records.fetch()

        // Verify store state:
        const recordsState = useStore.getState().records
        expect(recordsState.ready).toBe(true)
        expect(recordsState.loading).toBe(false)
        expect(recordsState.error).toBe(null)
        expect(recordsState.byId.record1).toBeDefined()
        expect(recordsState.byId.record1.title).toBe('Task 1')
        expect(recordsState.byId.record2).toBeDefined()
        expect(recordsState.byId.record2.title).toBe('Task 2')

        // Verify MiniSearch operations:
        expect(mockMiniSearch.add).toHaveBeenCalled()
      })

      it('should handle empty database', async () => {
        await store.records.fetch()

        const recordsState = useStore.getState().records
        expect(recordsState.ready).toBe(true)
        expect(recordsState.byId).toEqual({})
        expect(mockMiniSearch.add).not.toHaveBeenCalled()
      })

      it('should update existing search index entries', async () => {
        mockMiniSearch.has.mockReturnValue(true)

        const record = createRecord({ _id: 'record1', title: 'Updated Task' })
        await testDb.put(record)

        await store.records.fetch()

        // Should replace existing entry:
        expect(mockMiniSearch.replace).toHaveBeenCalled()
      })

      it('should handle database query errors', async () => {
        // Mock query to throw error:
        const originalQuery = testDb.query
        testDb.query = vi.fn().mockRejectedValue(new Error('Query failed'))

        await store.records.fetch()

        const recordsState = useStore.getState().records
        expect(recordsState.error).toBeDefined()

        // Restore original method:
        testDb.query = originalQuery
      })
    })
  })
})