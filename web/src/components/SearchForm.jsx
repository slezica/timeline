import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'


export default function SearchForm() {
  const index = useStore(state => state.index)

  const [query, setQuery] = useState('')

  const inputRef = useRef()

  useEffect(() => {
    const handleKey = (ev) =>  {
      if (ev.key === '/') {
        ev.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const newItem = {
      ...extras,
      title: title.trim(),
      kind: kind,
      createdDate: new Date().toISOString()
    }


    try {
      await createItem.run(newItem)
      setTitle('')
      setExtras({})

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <fieldset>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          disabled={createItem.loading}
        >
          <option value="note">Note</option>
          <option value="task">Task</option>
        </select>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter item title..."
          disabled={createItem.loading}
          aria-busy={createItem.loading}
          ref={inputRef}
        />
      </fieldset>

      {kind === 'task' && (
        <TaskItemFields
          value={extras}
          onChange={setExtras}
          disabled={createItem.loading}
        />
      )}

      <button 
        type="submit" 
        disabled={!title.trim() || createItem.loading}
        >
          {createItem.loading ? 'Creating...' : 'Create'}
      </button>


      {createItem.error && (
        <div role="alert">
          Error: {createItem.error}
        </div>
      )}
    </form>
  )
}


function TaskItemFields({ value, onChange, disabled }) {
  const [dueDate, setDueDate] = useState('')
  const [doneDate, setDoneDate] = useState('')

  const handleDueDateChange = (ev) => {
    const newDueDate = ev.target.value ? new Date(ev.target.value).toISOString() : ''
    setDueDate(newDueDate)
    onChange({ ...value, dueDate: newDueDate })
  }

  const handleDoneDateChange = (ev) => {
    const newDoneDate = ev.target.value ? new Date(ev.target.value).toISOString() : ''
    setDoneDate(newDoneDate)
    onChange({ ...value, doneDate: newDoneDate })
  }

  return (
    <fieldset>
      <div>
        <label>Due Date</label>
        <input
          type="date"
          value={dueDate.split('T')[0]}
          onChange={handleDueDateChange}
          disabled={disabled}
        />
      </div>
      <div>
        <label>Done Date</label>
        <input
          type="date"
          value={doneDate.split('T')[0]}
          onChange={handleDoneDateChange}
          disabled={disabled}
        />
      </div>
    </fieldset>
  )
}
