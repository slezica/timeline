import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import SmallItem from './SmallItem'


export default function Shelf({ onItemClick }) {
  const shelf = useStore(state => state.shelf)
  const index = useStore(state => state.index)
  const [draggingOver, setDraggingOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setDraggingOver(true)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDraggingOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDraggingOver(false)

    const itemId = e.dataTransfer.getData('text/plain')
    const item = index.byId[itemId]

    if (!item) { return }

    const isAlreadyInShelf = shelf.inOrder.some(id => id === itemId)
    if (isAlreadyInShelf) { return }

    const newShelfOrder = [...shelf.inOrder, itemId]
    shelf.replace(newShelfOrder)
  }

  return (
      <section
        className={`shelf ${draggingOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!draggingOver && shelf.inOrder.length === 0 && <p>Drag items from timeline</p>}

        {shelf.inOrder.map(id =>
          index.byId[id]
            ? <SmallItem key={id} item={index.byId[id]} onClick={onItemClick} /> 
            : <div class="placeholder">placeholder</div>
        )}
    ) 
    </section>
  )
}

