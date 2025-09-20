import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import SmallItem from './SmallItem'
import { getTransferData } from '../utils'


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

    const dragData = getTransferData(e.dataTransfer)
    console.log('shelf', dragData)
    if (!dragData?.id) { return }

    const item = index.byId[dragData.id]
    if (!item) { return }

    const isAlreadyInShelf = shelf.inOrder.some(id => id === dragData.id)
    if (isAlreadyInShelf) { return }

    const newShelfOrder = [...shelf.inOrder, dragData.id]
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
            : <div key={id} className="placeholder">placeholder</div>
        )}
    </section>
  )
}

