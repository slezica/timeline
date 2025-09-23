import '@testing-library/jest-dom'
import PouchDB from 'pouchdb'
import memoryAdapter from 'pouchdb-adapter-memory'

// Configure PouchDB with memory adapter:
PouchDB.plugin(memoryAdapter)

// Mock window.DEBUG:
globalThis.window = globalThis.window || {}
window.DEBUG = false