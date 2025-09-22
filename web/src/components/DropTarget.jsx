import React, { useRef, useState } from 'react'

export default function DropTarget({ onDragEnter, onDragLeave, onDragOver, onDrop, children }) {
  const [draggingOver, setDraggingOver] = useState(false)
  const counter = useRef(0)

  const handleDragEnterCapture = (ev) => {
    counter.current = Math.max(0, counter.current + 1)
    if (counter.current == 1) {
      setDraggingOver(true)
      onDragEnter?.(ev)
    }
  }

  const handleDragLeaveCapture = (ev) => {
    counter.current = Math.max(0, counter.current - 1)
    if (counter.current == 0) {
      setDraggingOver(false)
      onDragLeave?.(ev)
    }
  }

  const handleDragOver = (ev) => {
    ev.preventDefault()
    onDragOver?.(ev)
  }

  const handleDropCapture = (ev) => {
    ev.preventDefault()
    setDraggingOver(false)
    counter.current = 0
  }

  const handleDrop = (ev) => {
    onDrop?.(ev)
  }

  return React.Children.toArray(children).map(child => {
    if (!React.isValidElement(child)) return child

    const className = [child.props.className, draggingOver ? 'dragover' : null]
      .filter(Boolean)
      .join(' ')

    return React.cloneElement(child, {
      className,
      onDragEnterCapture: handleDragEnterCapture,
      onDragLeaveCapture: handleDragLeaveCapture,
      onDragOverCapture: handleDragOver,
      onDropCapture: handleDropCapture,
      onDrop: handleDrop
    })
  })
}