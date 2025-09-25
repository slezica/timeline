import { useRef } from 'react'
import { RefType, setTransferData, useDiscardEvent } from '../utils'


export default function TinyRecord({ record, onClick, onDiscard, children }) {
  const rootRef = useRef()

  const handleClick = (ev) => {
    ev.stopPropagation()
    onClick?.(record)
  }

  const handleDragStart = (ev) => {
    ev.stopPropagation()
    setTransferData(ev, { id: record._id }, RefType)
  }

  const handleDiscard = (ev) => {
    onDiscard?.(ev)
  }

  useDiscardEvent(rootRef.current, handleDiscard)

  return (
    <TinyRecordView
      record      = {record}
      rootRef     = {rootRef}
      onClick     = {handleClick}
      onDragStart = {handleDragStart}
    >
      {children}
    </TinyRecordView>
  )
}


function TinyRecordView({ record, onClick, onDragStart, rootRef, children }) {
  return (
    <article
      className   = {"record tiny " + record.kind}
      ref         = {rootRef}
      data-id     = {record.id}
      onClick     = {onClick}
      draggable   = {true}
      onDragStart = {onDragStart}
    >
      <header>
        <i className={`circle dot ${record.kind}`} />
        <strong className="title">{record.title || 'Untitled'}</strong>
        {children}
      </header>
    </article>
  )
}
