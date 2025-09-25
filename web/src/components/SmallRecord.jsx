import { useLayoutEffect, useRef } from 'react'
import { RefType, setTransferData } from '../utils'

function TaskRecordExtras({ record }) {
  return null
}

function NoteRecordExtras({ record }) {
  return null
}

export default function SmallRecord({ record, onClick, onRemove, onDiscard }) {
  const draggableRef = useRef()

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
    setTransferData(ev, { id: record._id }, RefType)
  }

  useLayoutEffect(() => {
    const handleDiscard = (ev) => {
      onDiscard?.({ id: record._id })
    }

    // The 'discard' event is custom, indicating this element was dropped outside
    // any drop area. It's fired in main.jsx.
    draggableRef.current.addEventListener('discard', handleDiscard)
    return () => { draggableRef.current.removeEventListener('discard', handleDiscard) }

  }, [onDiscard])

  return <SmallRecordView
    record       = {record}
    onClick      = {handleClick}
    onRemove     = {onRemove ? handleRemove : null}
    onDragStart  = {handleDragStart}
    draggableRef = {draggableRef}
  />
}


function SmallRecordView({ record, onClick, onRemove, onDragStart, onDiscard, draggableRef }) {
  return (
    <article
      ref         = {draggableRef}
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

      {
        record.kind == 'task' ? <TaskRecordExtras record={record} /> :
          record.kind == 'note' ? <NoteRecordExtras record={record} /> :
            null
      }
    </article>
  )
}