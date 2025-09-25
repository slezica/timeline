import DropTarget from './DropTarget'
import { useStore } from '../store'
import RefRecord from './RefRecord'
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

  const handleDrop = (ev) => {
    const data = getTransferData(ev, RefType)
    if (!data) { return }

    const ref = { id: data.id }
    if (record._id == ref.id) { return }
    if (record.refs.find(it => it.id == ref.id )) { return }

    saveRecord.run({ ...record, refs: [...record.refs, ref] })
  }

  return <LargeRecordView
    entries={entries}
    record={record}
    records={records}
    onClick={handleClick}
    onRefClick={handleRefClick}
    onDrop={handleDrop}
    onDragStart={handleDragStart}
  />
}


function LargeRecordView({ entries, record, records, onClick, onRefClick, onDrop, onDragStart }) {
  return (
    <DropTarget onDrop={onDrop}>
      <article
        className={"record large " + record.kind}
        data-id={record.id}
        style={{ cursor: 'pointer' }}
        draggable={true}
        onDragStart={onDragStart}
        onClick={onClick}
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

        <div className="refs">
          {record.refs.map(ref =>
            <RefRecord key={ref.id} record={records.byId[ref.id]} onClick={ev => onItemClick(records.byId[ref.id])} />
          )}
        </div>

        {window.DEBUG && <pre>{JSON.stringify(record, null, 2)}</pre>}
      </article>
    </DropTarget>
  )
}


function formatDisplayDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString() : null
}
