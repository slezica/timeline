import React from 'react'
import TaskItem from './TaskItem'
import NoteItem from './NoteItem'

export default function ShelfItem({ item }) {
  const renderItemContent = () => {
    switch (item.kind) {
      case 'task':
        return <TaskItem item={item} context="shelf" />
      case 'note':
        return <NoteItem item={item} context="shelf" />
      default:
        return (
          <>
            <strong>{item.title || 'Untitled'}</strong>
            <small>Unknown type: {item.kind}</small>
          </>
        )
    }
  }

  return (
    <div className="shelf-item">
      {renderItemContent()}
    </div>
  )
}