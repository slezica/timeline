import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStore } from '../store'

// Mock the database and utils
vi.mock('../database', () => ({
  db: {
    query: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    changes: vi.fn(() => ({
      on: vi.fn()
    }))
  },
  initializeDb: vi.fn()
}))

vi.mock('../utils', () => ({
  scheduled: (fn) => fn,
  genId: () => 'test-id-123'
}))


describe('Store', () => {
  beforeEach(() => {
    // Clear any previous state but don't override the functions
    const currentState = useStore.getState()
    useStore.setState({
      ...currentState,
      ready: false,
      items: {
        ...currentState.items,
        ready: false,
        error: null,
        loading: false,
        byId: {}
      },
      timeline: {
        ...currentState.timeline,
        ready: false,
        error: null,
        loading: false,
        refs: []
      },
      shelf: {
        ...currentState.shelf,
        ready: false,
        error: null,
        loading: false,
        refs: []
      },
      desk: {
        ...currentState.desk,
        ready: false,
        error: null,
        loading: false,
        refs: []
      },
      saveItem: { ...currentState.saveItem, loading: false, error: null, result: null },
      deleteItem: { ...currentState.deleteItem, loading: false, error: null, result: null },
      importFile: { ...currentState.importFile, loading: false, error: null, result: null }
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useStore.getState()

      expect(state.ready).toBe(false)
      expect(state.items.byId).toEqual({})
      expect(state.timeline.refs).toEqual([])
      expect(state.shelf.refs).toEqual([])
      expect(state.desk.refs).toEqual([])

      for (let entry of ['items', 'timeline', 'shelf', 'desk']) {
        expect(state[entry].ready).toBe(false)
        expect(state[entry].loading).toBe(false)
        expect(state[entry].error).toBe(null)
      }
    })
  })
})