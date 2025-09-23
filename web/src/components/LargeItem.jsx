import React from 'react'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'
import { useStore } from '../store'
import RefItem from './RefItem'
import Tag from './Tag'
import { getTransferData, setTransferData } from '../utils'


export default function LargeItem({ entries, item, onClick, onRefClick }) {
  const items = useStore(state => state.items)
  const saveItem = useStore(state => state.saveItem)

  const handleClick = (ev) => {
    onClick?.(item)
  }

  const handleRefClick = (item) => {
    onRefClick?.(item)
  }

  const handleDragStart = (ev) => {
    ev.stopPropagation()
    setTransferData(ev, { id: item._id })
  }

  const getValidTransferData = (ev) => {
    const data = getTransferData(ev)
    return (data?.id && items.byId[data.id]) ? data : null
  }

  const handleDrop = (ev) => {
    const data = getValidTransferData(ev)
    if (!data) { return }

    const ref = { id: data.id }
    if (item._id == ref.id) { return }
    if (item.refs.find(it => it.id == ref.id )) { return }

    saveItem.run({ ...item, refs: [...item.refs, ref] })
  }

  const refItems = item.refs?.map(ref => items.byId[ref.id]).filter(Boolean) || []

  return <LargeItemView
    entries={entries}
    item={item}
    refItems={refItems}
    onClick={handleClick}
    onRefClick={handleRefClick}
    onDrop={handleDrop}
    onDragStart={handleDragStart}
  />
}


function LargeItemView({ entries, item, refItems, onClick, onRefClick, onDrop, onDragStart }) {
  const refClickHandler = (refItem) => (ev) => {
    onRefClick?.(refItem)
  }

  return (
    <DropTarget onDrop={onDrop}>
      <article
        className={"item large " + item.kind}
        data-id={item.id}
        style={{ cursor: 'pointer' }}
        draggable={true}
        onDragStart={onDragStart}
        onClick={onClick}
      >
          <header>
            <i className={`circle ${item.kind} dot`} />
            <strong className="title">{item.title || 'Untitled'}</strong>

            {entries.map(entry =>
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
            {refItems.map(refItem =>
              <RefItem key={refItem._id} item={refItem} onClick={refClickHandler(refItem)} />
            )}
          </div>

          {window.DEBUG && <pre>{JSON.stringify(item, null, 2)}</pre>}
      </article>
    </DropTarget>
  )
}


function formatDisplayDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString() : null
}
