import React, { useLayoutEffect, useRef, useState } from 'react'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'
import RefItem from './RefItem'
import { useStore } from '../store'
import { getTransferData } from '../utils'
import EditableList from './EditableList'


export default function EditItemForm({ item, onSave, onCancel, onDelete }) {
  const [data, setData] = useState({ ...item })
  const items = useStore(state => state.items)
  const updateItem = useStore(state => state.updateItem)
  const saveItem = useStore(state => state.saveItem)

  const handleChange = (name, value) => {
    setData(prev => ({ ...prev, [name]: value }))
  }

  const changeHandler = (name) => (ev) => {
    handleChange(name, ev.target.value)
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()

    const updatedItem = {
      ...item,
      ...data,
      title: data.title
    }

    saveItem.run(updatedItem)
    onSave?.()
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handleDelete = () => {
    const updatedItem = {
      ...item,
      deleted: true
    }

    updateItem.run(updatedItem)
    onDelete?.()
  }

  const handleRemoveRef = (ref) => {
    setData(prev => ({ ...prev, refs: prev.refs.filter(it => it.id !== ref.id) }))
  }

  const getValidTransferData = (ev) => {
    const data = getTransferData(ev)
    return (data?.id && items.byId[data.id]) ? data : null
  }

  const handleSelfDrop = (ev) => {
    const itemRef = getValidTransferData(ev)
    if (!itemRef) { return }

    const newRefOrder = [...data.refs]

    const prevIndex = newRefOrder.findIndex(it => it.id == itemRef.id)
    if (prevIndex != -1) {
      newRefOrder.splice(prevIndex, 1)
    }
    newRefOrder.push(itemRef)
    setData(prev => ({ ...data, refs: newRefOrder }))
  }

  const handleChangeRefs = (newRefOrder) => {
    setData(prev => ({ ...data, refs: newRefOrder }))
  }

  return (
    <DropTarget onDrop={handleSelfDrop}>
      <article>
        <form className={`edit-item ${item.kind}`} data-id={item.id} onSubmit={handleSubmit}>
          <TopItemFields item={item} data={data} onChange={handleChange} />

          {
            data.kind == 'task' ? <TaskItemFields item={item} data={data} onChange={handleChange} /> :
            data.kind == 'note' ? <NoteItemFields item={item} data={data} onChange={handleChange} /> :
            null
          }

          <BottomItemFields item={item} data={data} onChange={handleChange} />

          {/* References section */}
          { (items.ready && data.refs && data.refs.length > 0) &&
              <ReferenceFields onRemove={handleRemoveRef} items={items} data={data} onChange={handleChangeRefs} />
          }

          {/* Footer with buttons */}
          <fieldset className="inline">
            <button className="delete" type="button" onClick={handleDelete}>Delete</button>
            <button className="cancel" type="button" onClick={handleCancel}>Cancel</button>
            <button type="submit">Save</button>
          </fieldset>
        </form>
      </article>
    </DropTarget>
  )
}


function TopItemFields({ item, data, onChange }) {
  const handleTitleRef = (el) => {
    el?.focus()
  }

  const changeHandler = (name) => (ev) => { onChange(name, ev.target.value) }

  return (
    <fieldset className="inline">
      <input
        className="title"
        type="text"
        value={data.title}
        onChange={changeHandler('title')}
        ref={handleTitleRef}
      />

      <select className="kind" value={data.kind} onChange={changeHandler('kind')}>
        <option value="task">Task</option>
        <option value="note">Note</option>
        <option value="contact">Contact</option>
      </select>
      <i className={`circle dot ${data.kind}`} />
    </fieldset>
  )
}


function BottomItemFields({ item, data, onChange }) {
  const changeHandler = (name) => (ev) => { onChange(name, ev.target.value) }

  return (
    <fieldset>
      <textarea value={data.body || ''} onChange={changeHandler('body')} rows={8} />
    </fieldset>
  )
}


function TaskItemFields({ item, data, onChange }) {
  const changeHandler = (name) => (ev) => { onChange(name, ev.target.value) }

  const dueDate = formatDatetime(data.dueDate)
  const doneDate = formatDatetime(data.doneDate)

  return (
    <fieldset className="inline">
      <div>
        <label>Due</label>
        <input type="datetime-local" value={dueDate} onChange={changeHandler('dueDate')} />
      </div>

      <div>
        <label>Done</label>
        <input type="datetime-local" value={doneDate} onChange={changeHandler('doneDate')} />
      </div>
    </fieldset>
  )
}


function NoteItemFields({ item, data, onChange }) {
  return null
}


function ReferenceFields({ items, data, onRemove, onDrop, onChange }) {
  const eventToRef = (ev) => {
    const data = getTransferData(ev)
    return (data?.id && items.byId[data.id]) ? data : null
  }

  const refToChild = (ref) => (
    <RefItem item={items.byId[ref.id]} onRemove={onRemove}>
      <button type="button" className="delete action" onClick={() => onRemove(ref)}><i className="cross" /></button>
    </RefItem>
  )

  return (
    <fieldset>
      <EditableList
        className="refs"
        entries={data.refs}
        isEqual={(a, b) => a._id == b._id}
        fromEvent={eventToRef}
        toChild={refToChild}
        onChange={onChange}
      />
    </fieldset>
  )
}


function formatDatetime(isoString) {
  return isoString ? isoString.slice(0, isoString.lastIndexOf(':')) : ''
}