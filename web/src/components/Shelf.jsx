import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'
import PlaceholderItem from "./PlaceholderItem";
import { getTransferData } from '../utils';


export default function Shelf({ onClick }) {
  const shelf = useStore(state => state.shelf)
  const index = useStore(state => state.index)

  const dropParentRef = useRef()
  const [insertionPos, setInsertionPos] = useState(-1)

  const getValidTransferData = (ev) => {
    const data = getTransferData(ev)
    return (data?.id && index.byId[data.id]) ? data : null
  }

  const handleDragOver = (ev) => {
    setInsertionPos(getInsertionState(dropParentRef.current, ev))
  }

  const handleDragLeave = (ev) => {
    setInsertionPos(null)
  }

  const handleDrop = (ev) => {
    const ref = getValidTransferData(ev)
    if (!ref) { return }

    const item = index.byId[ref.id]
    const newShelfOrder = [...shelf.inOrder]

    const prevIndex = shelf.inOrder.findIndex(it => it.id == ref.id)
    if (prevIndex) {
      newShelfOrder.splice(prevIndex, 1)
    }

    newShelfOrder.push(ref)
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
    <DropTarget onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      <section className="shelf" ref={dropParentRef}>
        {shelf.inOrder.map((ref, position) => {
          // Calculate empty space before insertion position, if any:
          const style = (position == insertionPos?.position)
            ? { paddingTop: insertionPos.offset + 'px' }
            : null

          console.log(style, insertionPos)

          return <ShelfEntry
            key={ref.id}
            item={index.byId[ref.id]}
            style={style}
            onClick={handleItemClick} />;
        }
        )}
      </section>
    </DropTarget>
  )
}


function ShelfEntry({ item, style, onClick }) {
  const handleClick = () => { onClick?.(item) }
  const selfRef = useRef()

  return (
    <div className="shelf-entry" ref={selfRef} style={style}>
      {item != null
        ? <SmallItem item={item} onClick={onClick} />
        : <PlaceholderItem />
      }
    </div>
  )
}


function getInsertionIndex(parent, ev) {
  if (parent.children.length == 0) { return }

  const firstRect = parent.children[0].getBoundingClientRect()
  const lastRect = parent.children[parent.children.length - 1].getBoundingClientRect()

  if (ev.clientY < firstRect.top + tolerancePx) {
    return 0
  }

  if (ev.clientY > lastRect.bottom - tolerancePx) {
    return parent.children.length
  }

  for (let i = 0; i < parent.children.length - 1; i++) {
    const currentRect = parent.children[i].getBoundingClientRect()
    const siblingRect = parent.children[i + 1].getBoundingClientRect()

    if (ev.clientY >= currentRect.bottom - tolerancePx && ev.clientY <= siblingRect.top + tolerancePx) {
      return i + 1
    }
  }

  return -1
}

