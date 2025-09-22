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

  const validDataHandler = (fn) => (ev) => {
    ev.preventDefault()

    const data = getTransferData(ev.dataTransfer)
    const files = ev.dataTransfer.files ?? []

    if (canDrop?.(data, files)) {
      ev.dataTransfer.dropEffect = 'copy'
      fn(data, files)
    }
  }

  const handleDragEnter = validDataHandler((data, files) => {
    counter.current++

    if (counter.current == 1) {
      setDraggingOver(true)
      onDragEnter?.(data, files)
    }
  })

  const handleDragOver = validDataHandler((data, files) => {
    onDragOver?.(data, files)
  })

  const handleDragLeave = validDataHandler((data, files) => {
    counter.current--

    if (counter.current == 0) {
      setDraggingOver(false)
      onDragLeave?.(data, files)
    }
  })

  const handleDrop = validDataHandler((data, files) => {
    setDraggingOver(false)
    onDrop?.(data, files)
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