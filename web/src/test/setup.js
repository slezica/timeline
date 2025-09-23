import '@testing-library/jest-dom'

// Mock crypto.randomUUID for tests
if (!globalThis.crypto) {
  globalThis.crypto = {
    randomUUID: () => `test-id-${Math.random().toString(36).substr(2, 9)}`
  }
}


// Mock window.DEBUG
globalThis.window = globalThis.window || {}
window.DEBUG = false