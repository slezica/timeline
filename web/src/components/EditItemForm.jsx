import React, { useState } from 'react'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'
import RefItem from './RefItem'
import { useStore } from '../store'
import { getTransferData } from '../utils'


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
      title: data.title || "Untitled"
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

  const handleRefDrop = (ev) => {
    const ref = getValidTransferData(ev)
    if (!ref) { return }

    ev.stopPropagation()
    const newRefOrder = [...data.refs]

    const refEl = ev.target.closest('.ref-entry')
    const newIndex = [...refEl.parentElement.children].indexOf(refEl)
    const oldIndex = data.refs.findIndex(it => it.id == ref.id)

    newRefOrder.splice(newIndex, 0, ref)

    if (oldIndex != -1) {
      newRefOrder.splice(oldIndex < newIndex ? oldIndex : oldIndex + 1, 1)
    }

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
              <ReferenceFields onRemove={handleRemoveRef} items={items} data={data} onDrop={handleRefDrop} />
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
  const changeHandler = (name) => (ev) => { onChange(name, ev.target.value) }

  return (
    <fieldset className="inline">
      <input
        className="title"
        type="text"
        value={data.title}
        onChange={changeHandler('title')}
        placeholder="Untitled"
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


function ReferenceFields({ items, data, onRemove, onDrop }) {
  const handleDragOver = (ev) => {
    ev.preventDefault() // necessary for drop to work
  }

  const handleDrop = (ev) => {
    ev.preventDefault()
    onDrop?.(ev)
  }

  const handleRemove = (item) => {
    onRemove?.({ id: item._id })
  }

  return (
    <fieldset>
      <div className="refs">
        {data.refs.map(ref =>
          items.byId[ref.id] && (
            <DropTarget key={ref.id} onDrop={handleDrop}>
              <div className="ref-entry">
                <RefItem item={items.byId[ref.id]} onRemove={handleRemove}>
                  <button type="button" className="delete action" onClick={() => onRemove(ref)}><i className="cross" /></button>
                </RefItem>
              </div>
            </DropTarget>
          )
        )}
      </div>
    </fieldset>
  )
}


function formatDatetime(isoString) {
  return isoString ? isoString.slice(0, isoString.lastIndexOf(':')) : ''
}