import React from 'react'

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
    <div className={"item small " + item.kind} data-id={item.id} onClick={handleClick}>
      <strong className="title">{item.title || 'Untitled'}</strong>
      <small className="kind">{item.kind}</small>

        { 
          item.kind == 'task' ? <TaskItemExtras item={item} /> :
          item.kind == 'note' ? <NoteItemExtras item={item} /> :
          null
        }
    </div>
  )
}