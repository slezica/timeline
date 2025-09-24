import React from 'react'
import { setTransferData } from '../utils'


export default function RefItem({ item, onClick, children }) {
  const handleClick = (ev) => {
    ev.stopPropagation()
    onClick?.(item)
  }

  const handleDragStart = (ev) => {
    ev.stopPropagation()
    setTransferData(ev, { id: item._id })
  }

  return (
    <RefItemView
      item={item}
      onClick={handleClick}
      onDragStart={handleDragStart}
    >
      {children}
    </RefItemView>
  )
}


function RefItemView({ item, children, onClick, onDragStart }) {
  return (
    <article
      className={"item ref " + item.kind}
      data-id={item.id}
      onClick={onClick}
      draggable={true}
      onDragStart={onDragStart}
    >
      <header>
        <i className={`circle dot ${item.kind}`} />
        <strong className="title">{item.title || 'Untitled'}</strong>
        {children}
      </header>
    </article>
  )
}
