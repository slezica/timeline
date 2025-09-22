import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'
import PlaceholderItem from "./PlaceholderItem";
import { getTransferData } from '../utils';


export default function Shelf({ onClick }) {
  const shelf = useStore(state => state.shelf)
  const index = useStore(state => state.index)

  const getValidTransferData = (ev) => {
    const data = getTransferData(ev)
    return (data?.id && index.byId[data.id]) ? data : null
  }

  const handleSelfDrop = (ev) => {
    const itemRef = getValidTransferData(ev)
    if (!itemRef) { return }

    const newShelfOrder = [...shelf.inOrder]

    const prevIndex = newShelfOrder.findIndex(it => it.id == itemRef.id)
    if (prevIndex != -1) {
      newShelfOrder.splice(prevIndex, 1)
    }

    newShelfOrder.push(itemRef)
    shelf.replace(newShelfOrder)
  }

  const handleEntryDrop = (ev) => {
    const ref = getValidTransferData(ev)
    if (!ref) { return }

    ev.stopPropagation()

    const item = index.byId[ref.id]
    const newShelfOrder = [...shelf.inOrder]

    let newIndex = [...ev.target.parentElement.children].indexOf(ev.target)
    let oldIndex = shelf.inOrder.findIndex(it => it.id == ref.id)

    newShelfOrder.slice(newIndex, 0, ref)

    if (oldIndex != -1) {
      newShelfOrder.splice(oldIndex, 1)
      if (oldIndex < newIndex) { newIndex++ }
    }

    newShelfOrder.splice(newIndex, 0, ref)
    shelf.replace(newShelfOrder)
  }

  const handleItemClick = (item) => {
    onClick?.(item)
  }

  const handleItemRemove = (ref) => {
    const i = shelf.inOrder.findIndex(it => it.id == ref.id)
    if (i == -1) { return }

    shelf.replace([...shelf.inOrder.slice(0, i), ...shelf.inOrder.slice(i + 1)])
  }

  return (
    <DropTarget onDrop={handleSelfDrop}>
      <section className="shelf">
        {shelf.inOrder.map((ref, position) => {
          return <ShelfEntry
            key={ref.id}
            item={index.byId[ref.id]}
            onClick={handleItemClick}
            onDrop={handleEntryDrop} />;
        }
        )}
      </section>
    </DropTarget>
  )
}

function ShelfEntry({ item, style, onDrop, onClick }) {
  const selfRef = useRef()

  return (
    <DropTarget onDrop={onDrop}>
      <div className="entry" ref={selfRef} style={style}>
        {item != null
          ? <SmallItem item={item} onClick={onClick} />
          : <PlaceholderItem />
        }
      </div>
    </DropTarget>
  )
}



