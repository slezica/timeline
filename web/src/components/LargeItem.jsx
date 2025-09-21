import React from 'react'
import SmallItem from './SmallItem'
import Draggable from './Draggable'
import DropTarget from './DropTarget'
import { useStore } from '../store'
import RefItem from './RefItem'
import Tag from './Tag'

function formatDatetime(str) {
  return str.slice(0, str.lastIndexOf(':'))
}

function TaskItemExtras({ item }) {
  const formatDisplayDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : null

  return (
    <>
      { item.body && (
        <div className="body">
        {item.body}
        </div>
      )}

      { (item.dueDate || item.doneDate) && (
        <div className="tags">
          { item.dueDate && 
            <Tag icon="calendar" name="Due" content={formatDisplayDate(item.dueDate)} />
          }
          { item.doneDate && 
            <Tag icon="calendar" name="Done" content={formatDisplayDate(item.doneDate)} />
          }
        </div>
      )}
    </>
  )
}

function NoteItemExtras({ item }) {
  return (
    <>
      { item.body && (
        <div className="body">
          {item.body}
        </div>
      )}
    </>
  )
}

function ContactItemExtras({ item }) {
  return (
    <>
      <img class="picture" src={item.picture} />
      <div class="tags">
        <Tag icon="envelope" content={item.email} />

        { item.phones.map(it =>
          <Tag icon="phone" content={it.number} />
        )}
      </div>
    </>
  )
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

  const ref = { id: item._id }

  return (
    <Draggable data={ref}>
      <DropTarget onDrop={handleDrop} canDrop={canDrop}>
        <article
          className={"item large " + item.kind}
          data-id={item.id}
          style={{ cursor: 'pointer' }}
        >
          <header onClick={handleClick}>
            <span className="dot" />
            <strong className="title">{item.title || 'Untitled'}</strong>

            {group.map(entry =>
              <span className="tags" key={entry.event}>
                <kbd className={"tag " + entry.event}>{entry.event}</kbd>
              </span>
            )}
          </header>

          {
            item.kind == 'task'    ? <TaskItemExtras item={item} /> :
            item.kind == 'note'    ? <NoteItemExtras item={item} /> :
            item.kind == 'contact' ? <ContactItemExtras item={item} /> :
            null
          }

          { window.DEBUG && <pre>{JSON.stringify(item, null, 2)}</pre> }

          {item.refs && item.refs.length > 0 && index && (
            <div className="refs">
              {item.refs.map(ref => {
                const refItem = index.byId[ref.id]
                if (!refItem) { return null }

                return (
                  <RefItem key={ref.id} item={refItem} onClick={onClick} />
                )
              })}
            </div>
          )}
        </article>
      </DropTarget>
    </Draggable>
  )
}