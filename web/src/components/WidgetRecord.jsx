import DropTarget from './DropTarget'
import { useStore } from '../store'
import TinyRecord from './TinyRecord'
import Tag from './Tag'
import DropList from './DropList'
import { debounce, getTransferData, indexInParent, RefType, setTransferData, useDiscardEvent } from '../utils'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'


export default function WidgetRecord({ record, onClick, onRefClick, onDiscard }) {
  const records = useStore(state => state.records)
  const [data, setData] = useState({})
  const rootRef = useRef()

  const saveData = useCallback(debounce(100, async (newRecord) => {
    await records.save(newRecord)
  }), [])

  const update = (fields) => {
    const newData = { ...data, ...fields } 
    setData(newData)

    const newRecord = { ...record, ...newData }
    saveData(newRecord)
  }

  const handleClick = (ev) => {
    onClick?.(record)
  }

  const handleRefClick = (record) => {
    onRefClick?.(record)
  }

  const handleDragStart = (ev) => {
    ev.stopPropagation()
    const ref = { id: record._id }
    setTransferData(ev, RefType, { ref })
  }

  const handleRefDrop = (ev) => {
    const { ref, dropSpot } = getTransferData(ev, RefType)
    if (!dropSpot || !ref || ref.id == record.id) { return }

    const index = dropSpot.index

    const newRefs = [
      ...record.refs.slice(0, index).filter(it => it.id != ref.id),
      ref,
      ...record.refs.slice(index).filter(it => it.id != ref.id),
    ]

    update({ refs: newRefs })
  }

  const handleRefDiscard = (ev) => {
    const index = indexInParent(ev.currentTarget)

    const newRefs = [
      ...record.refs.slice(0, index),
      ...record.refs.slice(index + 1),
    ]

    update({ refs: newRefs })
  }

  const handleBodyInput = (ev) => {
    const el = ev.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 15) + 'em'

    update({ body: ev.target.value })
  }

  const handleDiscard = (ev) => {
    onDiscard?.(ev)
  }

  useDiscardEvent(rootRef.current, handleDiscard)

  return <WidgetRecordView
    rootRef      = {rootRef}
    record       = {{...record, ...data}}
    records      = {records}
    onClick      = {handleClick}
    onRefClick   = {handleRefClick}
    onRefDrop    = {handleRefDrop}
    onRefDiscard = {handleRefDiscard}
    onDragStart  = {handleDragStart}
    onBodyInput  = {handleBodyInput}
  />
}


function WidgetRecordView({
  rootRef,
  record,
  records,
  onClick,
  onRefClick,
  onRefDrop,
  onRefDiscard,
  onDragStart,
  onBodyInput,
  bodyRef,
}) {
  const nop = () => {}

  return (
    <article
      ref         = {rootRef}
      className   = {"record widget " + record.kind}
      onClick     = {onClick}
      data-id     = {record.id}
    >
      <DropTarget onDrop={onRefDrop} onDragStart={onDragStart}>
        <header draggable={true}>
          <i className={`circle ${record.kind} dot`} />
          <strong className="title">{record.title || 'Untitled'}</strong>
        </header>
      </DropTarget>

      {record.body && (
        <textarea className="body" value={record.body} onInput={onBodyInput}  />
      )}

      <div className="extras">
        {record.kind == 'contact' &&
          <div className="picture">
            <img src={record.picture} />
          </div>
        }

        {record.kind == 'task' &&
          <div className="tags">
            <Tag icon="calendar">{formatDisplayDate(record.dueDate) || '–'}</Tag>
            <Tag icon="check">{formatDisplayDate(record.doneDate) || '–'}</Tag>
          </div>
        }

        {record.kind == 'contact' &&
          <div className="tags">
            <Tag icon="envelope">{record.email || '–'}</Tag>

            {record.phones.length > 0
              ? record.phones.map((it, i) => <Tag key={i} icon="phone">{it.number}</Tag>)
              : <Tag icon="phone"><em>Unknown</em></Tag>
            }
          </div>
        }
      </div>

      <div className="refs">
        <DropList onDrop={onRefDrop}>
          {record.refs.map(ref =>
            <TinyRecord
              key       = {ref.id}
              record    = {records.byId[ref.id]}
              onClick   = {ev => onRefClick(records.byId[ref.id])}
              onDiscard = {onRefDiscard}
            />
          )}
        </DropList>
      </div>

      {window.DEBUG && <pre>{JSON.stringify(record, null, 2)}</pre>}
    </article>
  )
}


function formatDisplayDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString() : null
}
