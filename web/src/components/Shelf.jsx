import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'


export default function Shelf({ onItemClick }) {
  const shelf = useStore(state => state.shelf)
  const index = useStore(state => state.index)
  const [draggingOver, setDraggingOver] = useState(false)

  const handleDrop = (data) => {
    setDraggingOver(false)

    const item = index.byId[data.id]
    if (!item) { return }

    const isAlreadyInShelf = shelf.inOrder.some(it => it.id === data.id)
    if (isAlreadyInShelf) { return }

    const newShelfOrder = [...shelf.inOrder, {id: data.id}]
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

  const handleRemove = (ref) => {
    const i = shelf.inOrder.findIndex(it => it.id == ref.id)
    if (i == -1) { return }

    shelf.replace([...shelf.inOrder.slice(0, i), ...shelf.inOrder.slice(i+1)])
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

        {shelf.inOrder.map(ref =>
          index.byId[ref.id]
            ? <SmallItem key={ref.id} item={index.byId[ref.id]} onClick={onItemClick} onRemove={handleRemove} />
            : <div key={ref.id} className="placeholder">placeholder</div>
        )}
      </section>
    </DropTarget>
  )
}

