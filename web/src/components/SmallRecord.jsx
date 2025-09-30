import {  useRef } from 'react'
import { RefType, setTransferData, useDiscardEvent } from '../utils'


export default function SmallRecord({ record, onClick, onRemove, onDiscard }) {
  const rootRef = useRef()

  const handleClick = () => {
    onClick?.(record)
  }

  const handleRemove = (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    onRemove?.({ id: record._id })
  }

  const handleDragStart = (ev) => {
    ev.stopPropagation()
    const ref = { id: record._id }
    setTransferData(ev, RefType, { ref })
  }

  const handleDiscard = (ev) => {
    onDiscard?.(ev)
  }

  useDiscardEvent(rootRef.current, handleDiscard)

  return <SmallRecordView
    record      = {record}
    onClick     = {handleClick}
    onRemove    = {onRemove ? handleRemove : null}
    onDragStart = {handleDragStart}
    rootRef     = {rootRef}
  />
}


function SmallRecordView({ record, onClick, onRemove, onDragStart, rootRef }) {
  return (
    <article
      ref         = {rootRef}
      className   = {"record small " + record.kind}
      draggable   = {true}
      onClick     = {onClick}
      onDragStart = {onDragStart}
      data-id     = {record.id}
    >
      <header>
        <i className={`circle dot ${record.kind}`} />
        <strong className="title">{record.title || 'Untitled'}</strong>
        {onRemove &&
          <span className="remove" onClick={onRemove}>X</span>
        }
      </header>

      {record.body && (
        <p className="body">
          {record.body}
        </p>
      )}
    </article>
  )
}