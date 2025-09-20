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

  const handleDrop = (data) => {
    if (canDrop(data)) {
      store.updateItem.run({ ...item, refs: [...item.refs, { id: data.id }] })
    }
  }

  const canDrop = (data) => {
    return data
      && data.id
      && data.id !== item.id
      && !item.refs.some(ref => ref.id == data.id)
  }

  return (
    <Draggable data={item}>
      <DropTarget onDrop={handleDrop} canDrop={canDrop}>
        <article
          className={"item large " + item.kind}
          data-id={item.id}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
      <header>
        <strong className="title">{item.title || 'Untitled'}</strong>

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