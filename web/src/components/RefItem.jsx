import React from 'react'
import { setTransferData } from '../utils'


export default function RefItem({ item, onClick, onRemove }) {

  const handleClick = () => {
    onClick?.(item)
  }

  const handleRemove = () => {
    onRemove(item)
  }

  const ref = { id: item._id }

  const handleDragStart = (ev) => {
    ev.dataTransfer.effectAllowed = 'copy'
    setTransferData(ev.dataTransfer, ref)
  }

  return (
    <article
      className={"item ref " + item.kind}
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
    </article>
  )
}
