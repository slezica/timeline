import React from 'react'
import { createRoot } from 'react-dom/client'
import '@picocss/pico'
import App from './components/App'
import { db, initializeDb } from './database'

import './samples'

const container = document.body
const root = createRoot(container)
root.render(<App />)

