import React from 'react'
import Draggable from './Draggable'


export default function RefItem({ item, onClick, onRemove }) {

  const handleClick = () => {
    onClick?.(item)
  }

  const handleRemove = () => {
    onRemove(item)
  }

  const ref = { id: item._id }

  return (
    <Draggable data={ref}>
      <article className={"item ref " + item.kind} data-id={item.id} onClick={handleClick}>
        <header>
          <span className="dot" />
          <strong className="title">{item.title || 'Untitled'}</strong>

          { onRemove &&
            <span className="remove" onClick={handleRemove}>X</span> 
          }
        </header>
      </article>
    </Draggable>
  )
}
