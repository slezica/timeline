import { useStore } from '../store'
import SmallRecord from './SmallRecord'
import { getTransferData, indexInParent, RefType } from '../utils'
import DropList from './DropList'
import WidgetRecord from './WidgetRecord'


export default function Collection({ collection, render, onRecordClick, onChange, className }) {
  const records = useStore(state => state.records)

  const handleRecordClick = (record) => {
    onRecordClick?.(record)
  }

  const handleRecordDiscard = (ev) => {
    const { ref, dropSpot } = getTransferData(ev, RefType)
    if (!dropSpot || !ref) { return }

    const newRefs = [
      ...collection.refs.slice(0, dropSpot.index),
      ...collection.refs.slice(dropSpot.index + 1),
    ]

    collection.replace(newRefs)
  }

  const handleRefDrop = (ev) => {
    const { ref, dropSpot } = getTransferData(ev, RefType)
    if (!dropSpot || !ref) { return }

    const newRefs = [
      ...collection.refs.slice(0, dropSpot.index).filter(it => it.id != ref.id),
      ref,
      ...collection.refs.slice(dropSpot.index).filter(it => it.id != ref.id),
    ]

    collection.replace(newRefs)
  }

  return <CollectionView
    render          = {render}
    refs            = {collection.refs}
    records         = {records}
    onRefDrop       = {handleRefDrop}
    onRecordDiscard = {handleRecordDiscard}
    onRecordClick   = {handleRecordClick}
    className       = {className}
  />
}


function CollectionView({ render, refs, records, onRefDrop, onRecordDiscard, onRecordClick, className }) {
  return (
    <section className={`collection ${className}`}>
      <div className="refs">
        <DropList onDrop={onRefDrop}>
          {refs.map(ref =>
            <WidgetRecord
              key       = {ref.id}
              record    = {records.byId[ref.id]}
              onClick   = {ev => onRecordClick(records.byId[ref.id])}
              onDiscard = {onRecordDiscard}
            />
          )}
        </DropList>
      </div>
    </section>
  )
}

