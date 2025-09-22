import React from 'react'
import SmallItem from './SmallItem'
import { useStore } from '../store'
import RefItem from './RefItem'
import Tag from './Tag'
import { setTransferData, getTransferData } from '../utils'


export default function LargeItem({ group, item, onClick, index }) {
  const store = useStore()

  const handleClick = (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      onClick?.(item)
    }
  }

  const canDrop = (data) => {
    return data
      && data.id
      && data.id !== item.id
      && !item.refs.some(ref => ref.id == data.id)
  }

  const handleDrop = (ev) => {
    ev.preventDefault()
    const data = getTransferData(ev.dataTransfer)
    if (canDrop(data)) {
      store.updateItem.run({ ...item, refs: [...item.refs, { id: data.id }] })
    }
  }

  const handleDragOver = (ev) => {
    const data = getTransferData(ev.dataTransfer)
    if (canDrop(data)) {
      ev.preventDefault()
      ev.dataTransfer.dropEffect = 'copy'
    }
  }

  const draggableData = { id: item._id }

  const handleDragStart = (ev) => {
    ev.dataTransfer.effectAllowed = 'copy'
    setTransferData(ev.dataTransfer, draggableData)
  }

  return (
    <article
      className={"item large " + item.kind}
      data-id={item.id}
      style={{ cursor: 'pointer' }}
      draggable={true}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
          <header onClick={handleClick}>
            <i className="dot circle" />
            <strong className="title">{item.title || 'Untitled'}</strong>

            {group.map(entry =>
              <span className="tags" key={entry.event}>
                <kbd className={"tag " + entry.event}>{entry.event}</kbd>
              </span>
            )}
          </header>

          {item.body && (
            <div className="body">
              {item.body}
            </div>
          )}

          <div className="extras">
            {item.kind == 'contact' &&
              <div className="picture">
                <img src={item.picture} />
              </div>
            }

            {item.kind == 'task' &&
              <div className="tags">
                <Tag icon="calendar" name="Due">{formatDisplayDate(item.dueDate) || '–'}</Tag>
                <Tag icon="calendar" name="Done">{formatDisplayDate(item.doneDate) || '–'}</Tag>
              </div>
            }

            {item.kind == 'contact' &&
              <div className="tags">
                <Tag icon="envelope">{item.email || '–'}</Tag>

                {...[item.phones.length > 0
                  ? item.phones.map((it, i) => <Tag key={i} icon="phone">{it.number}</Tag>)
                  : <Tag icon="phone"><em>Unknown</em></Tag>
                ]}
              </div>}
          </div>

          <div className="refs">
            {item.refs.map(ref =>
              index.byId[ref.id] &&
              <RefItem key={ref.id} item={index.byId[ref.id]} onClick={onClick} />
            )}
          </div>

          {window.DEBUG && <pre>{JSON.stringify(item, null, 2)}</pre>}
    </article>
  )
}


function formatDisplayDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString() : null
}
