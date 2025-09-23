import React from 'react'
import { setTransferData } from '../utils'


export default function RefItem({ item, onClick, onRemove }) {

  const handleClick = () => {
    onClick?.(item)
  }

  const handleRemove = () => {
    onRemove(item)
  }

  const handleDragStart = (ev) => {
    ev.stopPropagation()
    setTransferData(ev, { id: item._id })
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
