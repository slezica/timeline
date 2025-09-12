import React, { useState } from 'react'
import { useStore } from '../store'

export default function CreateItemForm() {
  const [title, setTitle] = useState('')
  const createItem = useStore(state => state.createItem)
  const timeline = useStore(state => state.timeline)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    // Create optimistic item
    const optimisticItem = {
      id: `temp-${Date.now()}`,
      title: title.trim(),
      kind: 'item',
      datetime: new Date().toISOString()
    }

    // Add optimistically to timeline
    timeline.addItems({ items: [optimisticItem] }, 'prepend')

    try {
      await createItem.run({ title: title.trim() })
      setTitle('')
    } catch (error) {
      timeline.removeItem(optimisticItem.id)
    }
  }

  return (
    <form className="create-item-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter item title..."
          className="title-input"
          disabled={createItem.loading}
        />
        <button 
          type="submit" 
          className="create-button"
          disabled={!title.trim() || createItem.loading}
        >
          {createItem.loading ? 'Creating...' : 'Create'}
        </button>
      </div>

      {createItem.error && (
        <div className="create-error">
          Error: {createItem.error}
        </div>
      )}
    </form>
  )
}