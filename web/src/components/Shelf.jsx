import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import SmallItem from './SmallItem'
import { getTransferData } from '../utils'


export default function Shelf({ onItemClick }) {
  const shelf = useStore(state => state.shelf)
  const index = useStore(state => state.index)

  const canDrop = (data) => {
    return data?.id && index.byId[data.id]
  }

  const handleDrop = (ev) => {
    ev.preventDefault()
    const data = getTransferData(ev.dataTransfer)

    const item = index.byId[data.id]
    if (!item) { return }

    const isAlreadyInShelf = shelf.inOrder.some(it => it.id === data.id)
    if (isAlreadyInShelf) { return }

    const newShelfOrder = [...shelf.inOrder, {id: data.id}]
    shelf.replace(newShelfOrder)
  }

  const handleDragOver = (ev) => {
    const data = getTransferData(ev.dataTransfer)
    if (canDrop(data)) {
      ev.preventDefault()
      ev.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleRemove = (ref) => {
    const i = shelf.inOrder.findIndex(it => it.id == ref.id)
    if (i == -1) { return }

    shelf.replace([...shelf.inOrder.slice(0, i), ...shelf.inOrder.slice(i+1)])
  }

  return (
    <section
      className="shelf"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {shelf.inOrder.length === 0 && <p>Drag items from timeline</p>}

      {shelf.inOrder.map(ref =>
        index.byId[ref.id]
          ? <SmallItem key={ref.id} item={index.byId[ref.id]} onClick={onItemClick} onRemove={handleRemove} />
          : <div key={ref.id} className="placeholder">placeholder</div>
      )}
    </section>
  )
}
