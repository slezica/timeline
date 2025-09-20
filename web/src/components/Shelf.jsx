import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'


export default function Shelf({ onItemClick }) {
  const shelf = useStore(state => state.shelf)
  const index = useStore(state => state.index)
  const [draggingOver, setDraggingOver] = useState(false)

  const handleDrop = (data) => {
    const item = index.byId[data.id]
    if (!item) { return }

    const isAlreadyInShelf = shelf.inOrder.some(id => id === data.id)
    if (isAlreadyInShelf) { return }

    const newShelfOrder = [...shelf.inOrder, data.id]
    shelf.replace(newShelfOrder)
  }

  const canDrop = (data) => {
    return data?.id && index.byId[data.id]
  }

  const handleDragEnter = (data) => {
    setDraggingOver(true)
  }

  const handleDragLeave = () => {
    setDraggingOver(false)
  }

  return (
    <DropTarget
      onDrop={handleDrop}
      canDrop={canDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <section className={`shelf ${draggingOver ? 'drag-over' : ''}`}>
        {!draggingOver && shelf.inOrder.length === 0 && <p>Drag items from timeline</p>}

        {shelf.inOrder.map(id =>
          index.byId[id]
            ? <SmallItem key={id} item={index.byId[id]} onClick={onItemClick} />
            : <div key={id} className="placeholder">placeholder</div>
        )}
      </section>
    </DropTarget>
  )
}

