import React, { useState } from 'react'
import { useStore } from '../store'


export default function CreateItemForm() {
  const createItem = useStore(state => state.createItem)
  const timeline = useStore(state => state.timeline)

  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('note')
  const [extras, setExtras] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    // Create optimistic item
    const optimisticItem = {
      id: `temp-${Date.now()}`,
      title: title.trim(),
      kind: kind,
      datetime: new Date().toISOString()
    }

    // Add optimistically to timeline
    timeline.addItems({ items: [optimisticItem] }, 'prepend')

    try {
      const itemData = Object.assign(extras, { title: title.trim(), kind: kind })
      
      await createItem.run(itemData)
      setTitle('')
      setExtras({})

    } catch (error) {
      timeline.removeItem(optimisticItem.id)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="inline">
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
        />
        <button 
          type="submit" 
          disabled={!title.trim() || createItem.loading}
        >
          {createItem.loading ? 'Creating...' : 'Create'}
        </button>
      </fieldset>

      {kind === 'task' && (
        <TaskItemFields
          value={extras}
          onChange={setExtras}
          disabled={createItem.loading}
        />
      )}

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

  const handleDueDateChange = (newDueDate) => {
    setDueDate(newDueDate)
    onChange(Object.assign({}, value, { dueDate: newDueDate }))
  }

  const handleDoneDateChange = (newDoneDate) => {
    setDoneDate(newDoneDate)
    onChange(Object.assign({}, value, { doneDate: newDoneDate }))
  }

  return (
    <fieldset>
      <div className="grid">
        <div>
          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => handleDueDateChange(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div>
          <label>Done Date</label>
          <input
            type="date"
            value={doneDate}
            onChange={(e) => handleDoneDateChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </fieldset>
  )
}