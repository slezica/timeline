import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'
import PlaceholderItem from "./PlaceholderItem";
import { getTransferData } from '../utils';
import EditableList from './EditableList';


export default function Shelf({ onClick }) {
  const shelf = useStore(state => state.shelf)
  const items = useStore(state => state.items)

  const handleItemClick = (item) => {
    onClick?.(item)
  }

  const handleItemRemove = (ref) => {
    const i = shelf.refs.findIndex(it => it.id == ref.id)
    if (i == -1) { return }

    shelf.replace([...shelf.refs.slice(0, i), ...shelf.refs.slice(i + 1)])
  }

  const handleItemDiscard = (ref) => {
    const newRefs = [...shelf.refs]

    const refIndex = newRefs.findIndex(it => it.id == ref.id)
    newRefs.splice(refIndex, 1)

    shelf.replace(newRefs)
  }

  const handleListChange = (newRefs) => {
    shelf.replace(newRefs)
  }

  return <ShelfView
    refs={shelf.refs}
    items={items}
    onListChange={handleListChange}
    onItemDiscard={handleItemDiscard}
    onItemClick={handleItemClick}
  />
}


function ShelfView({ refs, items, onListChange, onItemDiscard, onItemClick }) {
  const eventToRef = (ev) => {
    const data = getTransferData(ev)
    return (data?.id && items.byId[data.id]) ? data : null
  }

  const refToChild = (ref) => (
    items.byId[ref.id] != null
      ? <SmallItem item={items.byId[ref.id]} onClick={onItemClick} onDiscard={onItemDiscard} />
      : <div>Placeholder</div>
  )

  return (
    <section className="shelf">
      <EditableList
        className="refs"
        entries={refs}
        isEqual={(a, b) => a.id == b.id}
        fromEvent={eventToRef}
        toChild={refToChild}
        onChange={onListChange}
      />
    </section>
  )
}

