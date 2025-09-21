import React, { useCallback, useEffect, useState } from 'react'
import { setTransferData } from '../utils'

export default function Draggable({ data, onDragStart, onDragEnd, children }) {
  const [ dragging, setDragging ] = useState(false)

  const handleDragStart = (ev) => {
    ev.dataTransfer.effectAllowed = 'copy'
    ev.currentTarget.classList.add('dragging')

    // Automatically serialize data to transfer
    setTransferData(ev.dataTransfer, data)

    setDragging(true)
    onDragStart?.(data, ev.dataTransfer.files ?? [])
  }

  const handleDragEnd = (ev) => {
    ev.currentTarget.classList.remove('dragging')

    setDragging(false)
    onDragEnd?.(data, ev.dataTransfer.files ?? [])
  }

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </div>
  )
}