import React from 'react'
import { createRoot } from 'react-dom/client'
import '@picocss/pico'
import App from './components/App'
import { db, initializeDb } from './database'

import './samples'

(function setUpDropOutsideToDiscard() {
  let draggedEl = null

  window.addEventListener('dragstart', (ev) => {
    if (ev.target) {
      draggedEl = ev.target.closest('[draggable="true"]') || null
    }
  }, true)

  window.addEventListener('dragend', (ev) => {
    draggedEl = null
  }, true)

  window.addEventListener('dragover', (ev) => {
    ev.preventDefault()
  })

  window.addEventListener('drop', (ev) => {
    // Catch unhandled drops on known elements:
    if (!draggedEl) { return }
    if (ev.defaultPrevented) { return }

    ev.preventDefault()
    draggedEl.dispatchEvent(new CustomEvent('discard', { bubbles: false }))
  })
})()

const container = document.body
const root = createRoot(container)
root.render(<App />)

