import React from 'react'
import SmallItem from './SmallItem'
import Draggable from './Draggable'
import DropTarget from './DropTarget'
import { useStore } from '../store'

function formatDatetime(str) {
  return str.slice(0, str.lastIndexOf(':'))
}

function TaskItemExtras({ item }) {
  const formatDisplayDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : null

  return (
    <>
      {(item.dueDate || item.doneDate) && (
        <div className="task-dates">
          { item.dueDate && 
            <span className="due-date">Due {formatDisplayDate(item.dueDate)}</span>
          }
          { item.doneDate && 
            <span className="done-date">Done {formatDisplayDate(item.doneDate)}</span>
          }
        </div>
      )}
    </>
  )
}

function NoteItemExtras({ item }) {
  return null
}

export default function LargeItem({ group, item, onClick, index }) {
  const store = useStore()

  const handleClick = (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      onClick?.(item)
    }
  }

  const handleDragStart = (e, data) => {
    e.dataTransfer.setData('text/plain', data.id)
  }

  const handleDrop = (e) => {
    const draggedItemId = e.dataTransfer.getData('text/plain')

    if (!draggedItemId || draggedItemId === item.id) {
      return
    }

    // Add reference to item
    const updatedItem = {
      ...item,
      refs: [...(item.refs || []), { id: draggedItemId }]
    }
    store.updateItem.run(updatedItem)
  }

  const canDrop = (e) => {
    const draggedItemId = e.dataTransfer.getData('text/plain') ||
      (e.dataTransfer.types.includes('text/plain') ? '' : null)

    // Prevent self-reference and duplicates
    return draggedItemId !== item.id &&
      !item.refs?.some(ref => ref.id === draggedItemId)
  }

  return (
    <Draggable data={item} onDragStart={handleDragStart}>
      <DropTarget onDrop={handleDrop} canDrop={canDrop}>
        <article
          className={"item large " + item.kind}
          data-id={item.id}
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

      {item.body && (
        <div className="body">
          {item.body}
        </div>
      )}

      { 
        item.kind == 'task' ? <TaskItemExtras item={item} /> :
        item.kind == 'note' ? <NoteItemExtras item={item} /> :
        null
      }

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
      </DropTarget>
    </Draggable>
  )
}