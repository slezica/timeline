import React from 'react'
import SmallItem from './SmallItem'
import Draggable from './Draggable'
import DropTarget from './DropTarget'
import { useStore } from '../store'
import RefItem from './RefItem'
import Tag from './Tag'


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

  const draggableData = { id: item._id }

  return (
    <Draggable data={draggableData}>
      <DropTarget onDrop={handleDrop} canDrop={canDrop}>
        <article
          className={"item large " + item.kind}
          data-id={item.id}
          style={{ cursor: 'pointer' }}
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
      </DropTarget>
    </Draggable>
  )
}


function formatDisplayDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString() : null
}
