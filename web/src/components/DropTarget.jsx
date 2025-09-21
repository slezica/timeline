import React, { useRef, useState } from 'react'
import { getTransferData } from '../utils'

export default function DropTarget({
  children,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  canDrop
}) {
  const [draggingOver, setDraggingOver] = useState(false)
  const counter = useRef(0)

  const isValidData = (data) => {
    return canDrop ? canDrop(data) : !!data
  }

  const validDataHandler = (fn) => (ev) => {
    ev.preventDefault()

    // Check for files first
    if (ev.dataTransfer.files && ev.dataTransfer.files.length > 0) {
      const files = Array.from(ev.dataTransfer.files)
      if (isValidData(files)) {
        ev.dataTransfer.dropEffect = 'copy'
        fn(files)
        return
      }
    }

    // Fall back to JSON data
    const data = getTransferData(ev.dataTransfer)
    if (isValidData(data)) {
      ev.dataTransfer.dropEffect = 'copy'
      fn(data)
    }
  }

  const handleDragEnter = validDataHandler(data => {
    counter.current++

    if (counter.current == 1) {
      setDraggingOver(true)
      onDragEnter?.(data)
    }
  })

  const handleDragOver = validDataHandler(data => {
    onDragOver?.(data)
  })

  const handleDragLeave = validDataHandler(data => {
    counter.current--

    if (counter.current == 0) {
      setDraggingOver(false)
      onDragLeave?.(data)
    }
  })

  const handleDrop = validDataHandler(data => {
    setDraggingOver(false)
    onDrop?.(data)
  })

  const className = `drop-target ${draggingOver ? 'drag-over' : ''}`

  return (
    <div
      className={className}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  )
}