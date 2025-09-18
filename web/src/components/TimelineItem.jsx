import React from 'react'
import TaskItem from './TaskItem'
import NoteItem from './NoteItem'

export default function TimelineItem({ group, item }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.effectAllowed = 'copy'
    e.currentTarget.classList.add('dragging')
  }

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging')
  }

  const renderItemContent = () => {
    switch (item.kind) {
      case 'task':
        return <TaskItem item={item} context="timeline" />
      case 'note':
        return <NoteItem item={item} context="timeline" />
      default:
        return (
          <>
            <h4>{item.title || 'Untitled'}</h4>
            <p>Unknown item type: {item.kind}</p>
          </>
        )
    }
  }

  return (
    <article
      className={"item " + item.kind}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <header>
        <h4>{item.title || 'Untitled'}</h4>

        {group.map(entry =>
          <span className="tags" key={entry.event}>
            <span className={"tag " + entry.event}>{entry.event}</span>
          </span>
        )}
      </header>

      {renderItemContent()}
    </article>
  )
}