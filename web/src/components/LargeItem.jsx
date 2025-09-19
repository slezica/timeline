import React from 'react'
import SmallItem from './SmallItem'

function formatDatetime(str) {
  return str.slice(0, str.lastIndexOf(':'))
}

function TaskItemExtras({ item }) {
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) { return null }
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <>
      {(item.dueDate || item.doneDate) && (
        <div className="task-dates">
          {item.dueDate && (
            <span className="due-date">Due: {formatDisplayDate(item.dueDate)}</span>
          )}
          {item.doneDate && (
            <span className="done-date">Done: {formatDisplayDate(item.doneDate)}</span>
          )}
        </div>
      )}
    </>
  )
}

function NoteItemExtras({ item }) {
  return null
}

export default function LargeItem({ group, item, onClick, index }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.effectAllowed = 'copy'
    e.currentTarget.classList.add('dragging')
  }

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging')
  }

  const renderItemExtras = () => {
    switch (item.kind) {
      case 'task':
        return <TaskItemExtras item={item} />
      case 'note':
        return <NoteItemExtras item={item} />
      default:
        return <p>Unknown item type: {item.kind}</p>
    }
  }

  const handleClick = (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      onClick?.(item)
    }
  }

  return (
    <article
      className={"item large " + item.kind}
      data-id={item.id}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <header>
        <strong class="title">{item.title || 'Untitled'}</strong>

        {group.map(entry =>
          <span className="tags" key={entry.event}>
            <span className={"tag " + entry.event}>{entry.event}</span>
          </span>
        )}
      </header>

      {renderItemExtras()}

      {item.body && (
        <div className="body">
          {item.body}
        </div>
      )}

      {item.refs && item.refs.length > 0 && index && (
        <div className="item-refs">
          {item.refs.map(ref => {
            const refItem = index.byId[ref.id]
            if (!refItem) { return null }

            return (
              <SmallItem key={ref.id} item={refItem} onClick={onClick} />
            )
          })}
        </div>
      )}
    </article>
  )
}