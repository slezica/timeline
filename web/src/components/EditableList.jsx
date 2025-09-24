import DropTarget from "./DropTarget"


export default function EditableList({ entries, toChild, fromEvent, onDrop, onChange, className }) {
  const handleSelfDrop = (ev) => {
    const entry = fromEvent(ev)
    if (!entry) { return }

    ev.preventDefault()

    const newOrder = [...entries]

    const prevIndex = newOrder.findIndex(it => it.id == entry.id)
    if (prevIndex != -1) {
      newOrder.splice(prevIndex, 1)
    }

    newOrder.push(entry)
    console.log('self', newOrder)
    onChange?.(newOrder)
  }

  const handleChildDrop = (ev) => {
    const entry = fromEvent(ev)
    if (!entry) { return }

    ev.preventDefault()
    ev.stopPropagation()

    const newOrder = [...entries]

    const dropTarget = ev.target.closest('.editable.list > .entry')
    if (!dropTarget) { return }

    const newIndex = [...dropTarget.parentElement.children].indexOf(dropTarget)
    const oldIndex = entries.findIndex(it => it.id == entry.id)

    newOrder.splice(newIndex, 0, entry)

    if (oldIndex != -1) {
      newOrder.splice(oldIndex < newIndex ? oldIndex : oldIndex + 1, 1)
    }

    console.log('child', newOrder)
    onChange?.(newOrder)
  }

  return(
    <DropTarget onDrop={handleSelfDrop}>
      <div className={`editable list ${className ?? ''}`}>
        {entries.map(it => (
          <DropTarget key={JSON.stringify(it)} onDrop={handleChildDrop}>
            <div className="entry">{toChild(it)}</div>
          </DropTarget>
        ))}
      </div>
    </DropTarget>
  )
}


