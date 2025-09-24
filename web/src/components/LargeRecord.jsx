import DropTarget from './DropTarget'
import { useStore } from '../store'
import RefRecord from './RefRecord'
import Tag from './Tag'
import { getTransferData, setTransferData } from '../utils'


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
    setTransferData(ev, { id: record._id })
  }

  const getValidTransferData = (ev) => {
    const data = getTransferData(ev)
    return (data?.id && records.byId[data.id]) ? data : null
  }

  const handleDrop = (ev) => {
    const data = getValidTransferData(ev)
    if (!data) { return }

    const ref = { id: data.id }
    if (record._id == ref.id) { return }
    if (record.refs.find(it => it.id == ref.id )) { return }

    saveRecord.run({ ...record, refs: [...record.refs, ref] })
  }

  const refRecords = record.refs?.map(ref => records.byId[ref.id]).filter(Boolean) || []

  return <LargeRecordView
    entries={entries}
    record={record}
    refRecords={refRecords}
    onClick={handleClick}
    onRefClick={handleRefClick}
    onDrop={handleDrop}
    onDragStart={handleDragStart}
  />
}


function LargeRecordView({ entries, record, refRecords, onClick, onRefClick, onDrop, onDragStart }) {
  const refClickHandler = (refRecord) => (ev) => {
    onRefClick?.(refRecord)
  }

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
          {refRecords.map(refRecord =>
            <RefRecord key={refRecord._id} record={refRecord} onClick={refClickHandler(refRecord)} />
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
