import React from 'react'

function formatDatetime(str) {
  return str.slice(0, str.lastIndexOf(':'))
}

function TaskItemExtras({ item }) {
  const handleDueDateChange = (newDueDate) => {
    console.log(newDueDate)
  }

  const handleDoneDateChange = (newDoneDate) => {
    console.log(newDoneDate)
  }

  const dueDate = item.dueDate ? formatDatetime(item.dueDate) : undefined
  const doneDate = item.doneDate ? formatDatetime(item.doneDate) : undefined

  return (
    <>
      {item.body && (
        <p>{item.body}</p>
      )}

      <form className="inline">
        <fieldset className="inline">
          <label>Due</label>
          <input type="datetime-local" value={"2017-06-01T08:30"} onChange={handleDueDateChange} />
          <label>Done</label>
          <input type="datetime-local" value={doneDate} onChange={handleDoneDateChange} />
        </fieldset>
      </form>
    </>
  )
}

function NoteItemExtras({ item }) {
  return (
    <>
      {item.body && (
        <p>{item.body}</p>
      )}
    </>
  )
}

export default function LargeItem({ group, item }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.effectAllowed = 'copy'
    e.currentTarget.classList.add('dragging')
  }

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging')
  }

  const renderItemExtras = () => {
    switch (item.kind) {
      case 'task':
        return <TaskItemExtras item={item} />
      case 'note':
        return <NoteItemExtras item={item} />
      default:
        return <p>Unknown item type: {item.kind}</p>
    }
  }

  return (
    <article
      className={"item " + item.kind}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <header>
        <h4>{item.title || 'Untitled'}</h4>

        {group.map(entry =>
          <span className="tags" key={entry.event}>
            <span className={"tag " + entry.event}>{entry.event}</span>
          </span>
        )}
      </header>

      {renderItemExtras()}
    </article>
  )
}