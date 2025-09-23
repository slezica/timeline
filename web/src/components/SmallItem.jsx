import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react'
import { setTransferData } from '../utils'

function TaskItemExtras({ item }) {
  return null
}

function NoteItemExtras({ item }) {
  return null
}

export default function SmallItem({ item, onClick, onRemove, onDiscard }) {
  const draggableRef = useRef()

  const handleClick = () => {
    onClick?.(item)
  }

  const handleRemove = (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    onRemove?.({ id: item._id })
  }

  const handleDragStart = (ev) => {
    ev.stopPropagation()
    setTransferData(ev, { id: item._id })
  }

  useLayoutEffect(() => {
    const handleDiscard = (ev) => {
      onDiscard?.({ id: item._id })
    }

    // The 'discard' event is custom, indicating this element was dropped outside
    // any drop area. It's fired in main.jsx.
    draggableRef.current.addEventListener('discard', handleDiscard)
    return () => { draggableRef.current.removeEventListener('discard', handleDiscard) }

  }, [onDiscard])

  return <SmallItemView
    item         = {item}
    onClick      = {handleClick}
    onRemove     = {onRemove ? handleRemove : null}
    onDragStart  = {handleDragStart}
    draggableRef = {draggableRef}
  />
}


function SmallItemView({ item, onClick, onRemove, onDragStart, onDiscard, draggableRef }) {
  return (
    <article
      ref         = {draggableRef}
      className   = {"item small " + item.kind}
      draggable   = {true}
      onClick     = {onClick}
      onDragStart = {onDragStart}
      data-id     = {item.id}
    >
      <header>
        <i className={`circle dot ${item.kind}`} />
        <strong className="title">{item.title || 'Untitled'}</strong>
        {onRemove &&
          <span className="remove" onClick={onRemove}>X</span>
        }
      </header>

      {item.body && (
        <p className="body">
          {item.body}
        </p>
      )}

      {
        item.kind == 'task' ? <TaskItemExtras item={item} /> :
          item.kind == 'note' ? <NoteItemExtras item={item} /> :
            null
      }
    </article>
  )
}