import React from 'react'
import { setTransferData } from '../utils'

function TaskItemExtras({ item }) {
  return null
}

function NoteItemExtras({ item }) {
  return null
}

export default function SmallItem({ item, onClick, onRemove }) {
  const handleClick = () => {
    onClick?.(item)
  }

  const handleRemove = (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    onRemove?.({ id: item._id })
  } 

  const ref = { id: item._id }

  const handleDragStart = (ev) => {
    ev.dataTransfer.effectAllowed = 'copy'
    setTransferData(ev.dataTransfer, ref)
  }

  return (
    <article
      className={"item small " + item.kind}
      data-id={item.id}
      onClick={handleClick}
      draggable={true}
      onDragStart={handleDragStart}
    >
        <header>
          <i className="dot circle" />
          <strong className="title">{item.title || 'Untitled'}</strong>
          { onRemove &&
            <span className="remove" onClick={handleRemove}>X</span>
          }
        </header>

        <p className="body">
          { item.body }
        </p>

        {
          item.kind == 'task' ? <TaskItemExtras item={item} /> :
          item.kind == 'note' ? <NoteItemExtras item={item} /> :
            null
        }
    </article>
  )
}