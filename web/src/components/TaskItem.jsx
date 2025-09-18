import React from 'react'

function formatDatetime(str) {
  return str.slice(0, str.lastIndexOf(':'))
}

export default function TaskItem({ item, context = 'timeline' }) {
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
      {context === 'shelf' && <strong>{item.title || 'Untitled'}</strong>}

      {item.body && (
        <p>{item.body}</p>
      )}

      {context === 'timeline' && (
        <form className="inline">
          <fieldset className="inline">
            <label>Due</label>
            <input type="datetime-local" value={"2017-06-01T08:30"} onChange={handleDueDateChange} />
            <label>Done</label>
            <input type="datetime-local" value={doneDate} onChange={handleDoneDateChange} />
          </fieldset>
        </form>
      )}

      {context === 'shelf' && <small>{item.kind}</small>}
    </>
  )
}