import React, { useEffect } from 'react'


export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    const handleEscape = (ev) => {
      if (ev.key === 'Escape') { onClose() }
    }

    if (open) { document.addEventListener('keydown', handleEscape) }
    return () => { document.removeEventListener('keydown', handleEscape) }

  }, [open, onClose])

  if (!open) {
    return null
  }

  const handleBackdropClick = (ev) => {
    if (ev.target === ev.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        {children}
      </div>
    </div>
  )
}