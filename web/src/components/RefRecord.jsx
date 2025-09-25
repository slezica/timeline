import { RefType, setTransferData } from '../utils'


export default function RefRecord({ record, onClick, children }) {
  const handleClick = (ev) => {
    ev.stopPropagation()
    onClick?.(record)
  }

  const handleDragStart = (ev) => {
    ev.stopPropagation()
    setTransferData(ev, { id: record._id }, RefType)
  }

  return (
    <RefRecordView
      record={record}
      onClick={handleClick}
      onDragStart={handleDragStart}
    >
      {children}
    </RefRecordView>
  )
}


function RefRecordView({ record, children, onClick, onDragStart }) {
  return (
    <article
      className={"record ref " + record.kind}
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
