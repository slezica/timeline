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
    <form onSubmit={handleSubmit}>
      <fieldset class="inline">
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