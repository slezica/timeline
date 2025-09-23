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

  const handleDragStart = (ev) => {
    setTransferData(ev, { id: item._id })
  }

  return <SmallItemView
    item={item}
    onClick={handleClick}
    onRemove={onRemove ? handleRemove : null}
    onDragStart={handleDragStart}
  />
}

function SmallItemView({ item, onClick, onRemove, onDragStart }) {
  return (
    <article
      className={"item small " + item.kind}
      data-id={item.id}
      onClick={onClick}
      draggable={true}
      onDragStart={onDragStart}
    >
      <header>
        <i className="dot circle" />
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