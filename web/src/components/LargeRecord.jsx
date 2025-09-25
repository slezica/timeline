import DropTarget from './DropTarget'
import { useStore } from '../store'
import TinyRecord from './TinyRecord'
import Tag from './Tag'
import { getTransferData, RefType, setTransferData } from '../utils'


export default function LargeRecord({ entries, record, onClick, onRefClick }) {
  const records = useStore(state => state.records)
  const saveRecord = useStore(state => state.saveRecord)

  const handleClick = (ev) => {
    onClick?.(record)
  }

  const handleRefClick = (record) => {
    onRefClick?.(record)
  }

  const handleDragStart = (ev) => {
    ev.stopPropagation()
    setTransferData(ev, { id: record._id }, RefType)
  }

  const handleRefDrop = (ev) => {
    const ref = getTransferData(ev, RefType)
    if (!ref || ref.id == record.id) { return }
    ev.stopPropagation()

    const index = [...ev.currentTarget.parentElement.children].indexOf(ev.currentTarget)

    const newRefs = [
      ...record.refs.slice(0, index).filter(it => it.id != ref.id),
      ref,
      ...record.refs.slice(index).filter(it => it.id != ref.id),
    ]

    saveRecord.run({ ...record, refs: newRefs })
  }

  return <LargeRecordView
    entries={entries}
    record={record}
    records={records}
    onClick={handleClick}
    onRefClick={handleRefClick}
    onRefDrop={handleRefDrop}
    onDragStart={handleDragStart}
  />
}


function LargeRecordView({ entries, record, records, onClick, onRefClick, onRefDrop, onDragStart }) {
  return (
    <article
      className   = {"record large " + record.kind}
      draggable   = {true}
      onDragStart = {onDragStart}
      onClick     = {onClick}
      data-id     = {record.id}
    >
      <header>
        <i className={`circle ${record.kind} dot`} />
        <strong className="title">{record.title || 'Untitled'}</strong>

        {entries.map(entry =>
          <span className="tags" key={entry.event}>
            <kbd className={"tag " + entry.event}>{entry.event}</kbd>
          </span>
        )}
      </header>

      {record.body && (
        <div className="body">
          {record.body}
        </div>
      )}

      <div className="extras">
        {record.kind == 'contact' &&
      <div className="picture">
        <img src={record.picture} />
      </div>
        }

        {record.kind == 'task' &&
        <div className="tags">
          <Tag icon="calendar" name="Due">{formatDisplayDate(record.dueDate) || '–'}</Tag>
          <Tag icon="calendar" name="Done">{formatDisplayDate(record.doneDate) || '–'}</Tag>
        </div>
        }

        {record.kind == 'contact' &&
        <div className="tags">
          <Tag icon="envelope">{record.email || '–'}</Tag>

          {record.phones.length > 0
            ? record.phones.map((it, i) => <Tag key={i} icon="phone">{it.number}</Tag>)
            : <Tag icon="phone"><em>Unknown</em></Tag>
          }
        </div>}
      </div>

      <ol className="refs">
        {record.refs.map(ref =>
          <DropTarget key={ref.id} onDrop={onRefDrop}>
            <li className="ref">
              <TinyRecord record={records.byId[ref.id]} onClick={ev => onRefClick(records.byId[ref.id])} />
            </li>
          </DropTarget>
        )}

        <DropTarget onDrop={onRefDrop}><div className="sentinel" /></DropTarget>
      </ol>


      {window.DEBUG && <pre>{JSON.stringify(record, null, 2)}</pre>}
    </article>
  )
}


function formatDisplayDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString() : null
}
