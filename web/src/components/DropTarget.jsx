import React, { useRef, useState } from 'react'
import { getTransferData } from '../utils'


export default function DropTarget({ onDragEnter, onDragLeave, onDragOver, onDrop, children }) {
  const [draggingOver, setDraggingOver] = useState(false)
  const counter = useRef(0)

  const handleDragEnter = (ev) => {
    if (++counter.current == 1) {
      setDraggingOver(true)
      onDragEnter?.(ev)
    }
  }

  const handleDragLeave = (ev) => {
    if (--counter.current == 0) {
      setDraggingOver(false)
      onDragLeave?.(ev)
    }
  }

  const handleDragOver = (ev) => {
    ev.preventDefault()
    onDragOver?.(ev)
  }

  const handleDrop = (ev) => {
    setDraggingOver(false)
    onDrop?.(ev)
  }

  return React.Children.toArray(children).map(child => 
    React.cloneElement(child, {
      className: child.props.className + (draggingOver ? ' dragover' : ''),
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    })
  )

  return (
    <>
      {children}
    </>
  )
}