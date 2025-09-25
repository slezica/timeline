import { useStore } from '../store'
import SmallRecord from './SmallRecord'
import { getTransferData, indexInParent, RefType } from '../utils'
import DropTarget from './DropTarget'
import WidgetRecord from './WidgetRecord'


export default function Shelf({ onClick }) {
  const shelf = useStore(state => state.shelf)
  const records = useStore(state => state.records)

  const handleRecordClick = (record) => {
    onClick?.(record)
  }

  const handleRecordDiscard = (ev) => {
    const index = indexInParent(ev.currentTarget)

    const newRefs = [
      ...shelf.refs.slice(0, index),
      ...shelf.refs.slice(index + 1),
    ]

    shelf.replace(newRefs)
  }

  const handleRefDrop = (ev) => {
    const ref = getTransferData(ev, RefType)
    if (!ref) { return }
    ev.stopPropagation()

    const index = [...ev.currentTarget.parentElement.children].indexOf(ev.currentTarget)

    const newRefs = [
      ...shelf.refs.slice(0, index).filter(it => it.id != ref.id),
      ref,
      ...shelf.refs.slice(index).filter(it => it.id != ref.id),
    ]

    shelf.replace(newRefs)
  }

  return <ShelfView
    refs            = {shelf.refs}
    records         = {records}
    onRefDrop       = {handleRefDrop}
    onRecordDiscard = {handleRecordDiscard}
    onRecordClick   = {handleRecordClick}
  />
}


function ShelfView({ refs, records, onRefDrop, onRecordDiscard, onRecordClick }) {
  return (
    <section className="shelf">
      <ol className="refs">
        {refs.map(ref =>
          <DropTarget key={ref.id} onDrop={onRefDrop}>
            <li className="ref">
              <WidgetRecord
                record    = {records.byId[ref.id]}
                onClick   = {ev => onRecordClick(records.byId[ref.id])}
                onDiscard = {onRecordDiscard}
              />
            </li>
          </DropTarget>
        )}

        <DropTarget onDrop={onRefDrop}><div className="sentinel" /></DropTarget>
      </ol>
    </section>
  )
}

