import { useStore } from '../store'
import SmallRecord from './SmallRecord'
import { getTransferData, indexInParent, RefType } from '../utils'
import DropTarget from './DropTarget'
import WidgetRecord from './WidgetRecord'


export default function Collection({ collection, render, onRecordClick, onChange, className }) {
  const records = useStore(state => state.records)

  const handleRecordClick = (record) => {
    onRecordClick?.(record)
  }

  const handleRecordDiscard = (ev) => {
    const index = indexInParent(ev.currentTarget)

    const newRefs = [
      ...collection.refs.slice(0, index),
      ...collection.refs.slice(index + 1),
    ]

    collection.replace(newRefs)
  }

  const handleRefDrop = (ev) => {
    const ref = getTransferData(ev, RefType)
    if (!ref) { return }
    ev.stopPropagation()

    const index = [...ev.currentTarget.parentElement.children].indexOf(ev.currentTarget)

    const newRefs = [
      ...collection.refs.slice(0, index).filter(it => it.id != ref.id),
      ref,
      ...collection.refs.slice(index).filter(it => it.id != ref.id),
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
      <ol className="refs">
        {refs.map(ref =>
          <DropTarget key={ref.id} onDrop={onRefDrop}>
            <li className="ref">
              { render({
                  record   : records.byId[ref.id],
                  onClick  : ev => onRecordClick(records.byId[ref.id]),
                  onDiscard: onRecordDiscard
                }
              )}
            </li>
          </DropTarget>
        )}

        <DropTarget onDrop={onRefDrop}><div className="sentinel" /></DropTarget>
      </ol>
    </section>
  )
}

