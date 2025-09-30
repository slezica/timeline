import { createRoot } from 'react-dom/client'
import '@picocss/pico'
import App from './components/App'

import './samples'
import { putSampleData } from './samples'
import { clearTransferData } from './utils'

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
    const newEv = new CustomEvent('discard', { bubbles: false })
    draggedEl.dispatchEvent(newEv)
  })
})();

(function setUpGlobalDataTransfer() {
  // Since drop with dataTransfer does not work on mobile, we use a global object (see utils).
  window.addEventListener('drop', () => {
    setTimeout(clearTransferData, 100)
  }, true)
})();

const container = document.body
const root = createRoot(container)
root.render(<App />)

