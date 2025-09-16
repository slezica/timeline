import React, { useState } from 'react'

function NoteItemExtras({ entry, item }) {
  return (
    <>
      <h3>{item.title || 'Untitled'}</h3>
      <pre><code>{JSON.stringify(item, null, 2)}</code></pre>
    </>
  )
}

function TaskItemExtras({ entry, item }) {
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

export default function TimelineItem({ entry, item }) {
  return (
    <article className={"item " + item.kind}>
      <header>
        <h4>{item.title || 'Untitled'}</h4>
        <span className={"tag " + entry.kind}>{entry.kind}</span>
        <span className={"tag"}>{new Date(entry.date).toLocaleString()}</span>
      </header>

      { item.kind == 'task' ? <TaskItemExtras entry={entry} item={item} /> :
        item.kind == 'note' ? <NoteItemExtras entry={entry} item={item} /> :
        null
      }
    </article>
  )
}

function formatDatetime(str) {
  return str.slice(0, str.lastIndexOf(':'))
}
