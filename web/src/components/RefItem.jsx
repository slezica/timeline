import React from 'react'
import Draggable from './Draggable'


export default function RefItem({ item, onClick }) {
  const handleClick = () => {
    onClick?.(item)
  }

  const ref = { id: item._id }

  return (
    <Draggable data={ref}>
      <article className={"item ref " + item.kind} data-id={item.id} onClick={handleClick}>
        <header>
          <span className="dot" />
          <strong className="title">{item.title || 'Untitled'}</strong>
        </header>
      </article>
    </Draggable>
  )
}
