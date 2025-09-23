import '@testing-library/jest-dom'

// Mock window.DEBUG
globalThis.window = globalThis.window || {}
window.DEBUG = false