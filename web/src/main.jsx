import React from 'react'
import { createRoot } from 'react-dom/client'
import '@picocss/pico'
import App from './components/App'
import { db, initializeDb } from './database'

import './samples'

window.DEBUG = true

const container = document.body
const root = createRoot(container)
root.render(<App />)

