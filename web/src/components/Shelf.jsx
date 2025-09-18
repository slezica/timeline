import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'


export default function Shelf() {
  const shelf = useStore(state => state.shelf)
  const index = useStore(state => state.index)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)

    const itemId = e.dataTransfer.getData('text/plain')
    const item = index.byId[itemId]

    if (!item) return

    const isAlreadyInShelf = shelf.inOrder.some(ref => ref.id === itemId)
    if (isAlreadyInShelf) return

    const newRef = {
      id: item.id,
      title: item.title,
      kind: item.kind
    }

    const newShelfOrder = [...shelf.inOrder, newRef]
    shelf.replace(newShelfOrder)
  }

  return (
    <section
      className={`shelf ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3>Shelf</h3>
      <p>{isDragOver ? 'Drop item here' : 'Drag items from timeline'}</p>
      { shelf.inOrder.map(ref =>
        <div key={ref.id} className="shelf-item">
          <strong>{ref.title || 'Untitled'}</strong>
          <small>{ref.kind}</small>
        </div>
      ) }
    </section>
  )
}

