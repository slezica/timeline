import React from 'react'

function TaskItemExtras({ item }) {
  return (
    <>
      <strong>{item.title || 'Untitled'}</strong>
      <small>{item.kind}</small>
    </>
  )
}

function NoteItemExtras({ item }) {
  return (
    <>
      <strong>{item.title || 'Untitled'}</strong>
      <small>{item.kind}</small>
    </>
  )
}

export default function SmallItem({ item, onClick }) {
  const renderItemExtras = () => {
    switch (item.kind) {
      case 'task':
        return <TaskItemExtras item={item} />
      case 'note':
        return <NoteItemExtras item={item} />
      default:
        return (
          <>
            <strong>{item.title || 'Untitled'}</strong>
            <small>Unknown type: {item.kind}</small>
          </>
        )
    }
  }

  const handleClick = () => {
    onClick?.(item)
  }

  return (
    <div
      className={"item small " + item.kind + " shelf-item"}
      data-id={item.id}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {renderItemExtras()}
    </div>
  )
}