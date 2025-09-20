import React from 'react'
import Draggable from './Draggable'

function TaskItemExtras({ item }) {
  return null
}

function NoteItemExtras({ item }) {
  return null
}

export default function SmallItem({ item, onClick }) {
  const handleClick = () => {
    onClick?.(item)
  }

  const handleDragStart = (e, data) => {
    e.dataTransfer.setData('text/plain', data.id)
  }

  return (
    <Draggable data={item} onDragStart={handleDragStart}>
      <div className={"item small " + item.kind} data-id={item.id} onClick={handleClick}>
        <strong className="title">{item.title || 'Untitled'}</strong>
        <small className="kind">{item.kind}</small>

          {
            item.kind == 'task' ? <TaskItemExtras item={item} /> :
            item.kind == 'note' ? <NoteItemExtras item={item} /> :
            null
          }
      </div>
    </Draggable>
  )
}