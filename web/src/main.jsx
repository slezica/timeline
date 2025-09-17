import React from 'react'
import { createRoot } from 'react-dom/client'
import '@picocss/pico'
import App from './components/App'
import { db, initializeDb } from './database'


const container = document.body
const root = createRoot(container)
root.render(<App />)

