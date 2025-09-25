import { RefType, setTransferData } from '../utils'


export default function TinyRecord({ record, onClick, children }) {
  const handleClick = (ev) => {
    ev.stopPropagation()
    onClick?.(record)
  }

  const handleDragStart = (ev) => {
    ev.stopPropagation()
    setTransferData(ev, { id: record._id }, RefType)
  }

  return (
    <TinyRecordView
      record={record}
      onClick={handleClick}
      onDragStart={handleDragStart}
    >
      {children}
    </TinyRecordView>
  )
}


function TinyRecordView({ record, children, onClick, onDragStart }) {
  return (
    <article
      className={"record tiny " + record.kind}
      data-id={record.id}
      onClick={onClick}
      draggable={true}
      onDragStart={onDragStart}
    >
      <header>
        <i className={`circle dot ${record.kind}`} />
        <strong className="title">{record.title || 'Untitled'}</strong>
        {children}
      </header>
    </article>
  )
}
