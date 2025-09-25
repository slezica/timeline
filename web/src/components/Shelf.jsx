import { useStore } from '../store'
import SmallRecord from './SmallRecord'
import { getTransferData, RefType } from '../utils'
import EditableList from './EditableList'


export default function Shelf({ onClick }) {
  const shelf = useStore(state => state.shelf)
  const records = useStore(state => state.records)

  const handleRecordClick = (record) => {
    onClick?.(record)
  }


  const handleRecordDiscard = (ref) => {
    const newRefs = [...shelf.refs]

    const refIndex = newRefs.findIndex(it => it.id == ref.id)
    newRefs.splice(refIndex, 1)

    shelf.replace(newRefs)
  }

  const handleListChange = (newRefs) => {
    shelf.replace(newRefs)
  }

  return <ShelfView
    refs={shelf.refs}
    records={records}
    onListChange={handleListChange}
    onRecordDiscard={handleRecordDiscard}
    onRecordClick={handleRecordClick}
  />
}


function ShelfView({ refs, records, onListChange, onRecordDiscard, onRecordClick }) {
  const eventToRef = (ev) => {
    const data = getTransferData(ev, RefType)
    return (data?.id && records.byId[data.id]) ? data : null
  }

  const refToChild = (ref) => (
    records.byId[ref.id] != null
      ? <SmallRecord record={records.byId[ref.id]} onClick={onRecordClick} onDiscard={onRecordDiscard} />
      : <div>Placeholder</div>
  )

  return (
    <section className="shelf">
      <EditableList
        className="refs"
        entries={refs}
        isEqual={(a, b) => a.id == b.id}
        fromEvent={eventToRef}
        toChild={refToChild}
        onChange={onListChange}
      />
    </section>
  )
}

