import React, { useState } from 'react'
import { useStore } from '../store'

export default function CreateItemForm() {
  const createItem = useStore(state => state.createItem)
  const timeline = useStore(state => state.timeline)

  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('note')

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
      await createItem.run({ title: title.trim(), kind: kind })
      setTitle('')
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

      {createItem.error && (
        <div role="alert">
          Error: {createItem.error}
        </div>
      )}
    </form>
  )
}