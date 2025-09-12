import React from 'react'
import { createRoot } from 'react-dom/client'
import '@picocss/pico'
import App from './components/App'

const container = document.body
if (!container) {
  throw new Error('Root element not found')
}

const root = createRoot(container)

root.render(<App />)