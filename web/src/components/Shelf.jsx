import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'
import PlaceholderItem from "./PlaceholderItem";
import { getTransferData } from '../utils';


export default function Shelf({ onClick }) {
  const shelf = useStore(state => state.shelf)
  const items = useStore(state => state.items)

  const getValidTransferData = (ev) => {
    const data = getTransferData(ev)
    return (data?.id && items.byId[data.id]) ? data : null
  }

  const handleSelfDrop = (ev) => {
    const itemRef = getValidTransferData(ev)
    if (!itemRef) { return }

    const newShelfOrder = [...shelf.refs]

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

    const item = items.byId[ref.id]
    const newShelfOrder = [...shelf.refs]

    const entry = findParentEntry(ev.target)
    const newIndex = [...entry.parentElement.children].indexOf(entry)
    const oldIndex = shelf.refs.findIndex(it => it.id == ref.id)

    newShelfOrder.splice(newIndex, 0, ref)

    if (oldIndex != -1) {
      newShelfOrder.splice(oldIndex < newIndex ? oldIndex : oldIndex + 1, 1)
    }
    console.log(newShelfOrder)
    shelf.replace(newShelfOrder)
  }

  const handleItemClick = (item) => {
    onClick?.(item)
  }

  const handleItemRemove = (ref) => {
    const i = shelf.refs.findIndex(it => it.id == ref.id)
    if (i == -1) { return }

    shelf.replace([...shelf.refs.slice(0, i), ...shelf.refs.slice(i + 1)])
  }

  return <ShelfView
    refs={shelf.refs}
    items={items.byId}
    onSelfDrop={handleSelfDrop}
    onEntryDrop={handleEntryDrop}
    onItemClick={handleItemClick}
  />
}


function ShelfView({ refs, items, onSelfDrop, onEntryDrop, onItemClick }) {
  return (
    <DropTarget onDrop={onSelfDrop}>
      <section className="shelf">
        {refs.map((ref, position) => {
          return <ShelfEntryView
            key={ref.id}
            item={items[ref.id]}
            onDrop={onEntryDrop}
            onClick={onItemClick}
          />
        })}
      </section>
    </DropTarget>
  )
}


function ShelfEntryView({ item, style, onDrop, onClick }) {
  return (
    <DropTarget onDrop={onDrop}>
      <div className="entry" style={style}>
        {item != null
          ? <SmallItem item={item} onClick={onClick} />
          : <PlaceholderItem />
        }
      </div>
    </DropTarget>
  )
}


function findParentEntry(el) {
  while (el) {
    if (el.classList.contains('entry')) { return el }
    el = el.parentElement
  }

  return null
}
