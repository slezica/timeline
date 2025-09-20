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

  return (
    <Draggable data={item}>
      <article className={"item small " + item.kind} data-id={item.id} onClick={handleClick}>
        <header>
          <span class="dot" />
          <strong className="title">{item.title || 'Untitled'}</strong>
        </header>

        <small className="kind">{item.kind}</small>

        {
          item.kind == 'task' ? <TaskItemExtras item={item} /> :
            item.kind == 'note' ? <NoteItemExtras item={item} /> :
              null
        }
      </article>
    </Draggable>
  )
}