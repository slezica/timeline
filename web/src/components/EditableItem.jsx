import React, { useState } from 'react'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'
import RefItem from './RefItem'


export default function EditableItem({ index, item, onSave, onCancel }) {
  const [data, setData] = useState({ ...item })

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
      title: data.title || 'Untitled'
    }

    onSave?.(updatedItem)
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handleRemoveRef = (ref) => {
    setData(prev => ({ ...prev, refs: prev.refs.filter(it => it.id !== ref.id) }))
  }

  const handleDrop = (data) => {
    if (canDrop(data)) {
      setData(prev => ({ ...prev, refs: [...prev.refs, { id: data.id }] }))
    }
  }

  const canDrop = (data) => {
    return data
      && data.id
      && data.id !== item.id
      && !item.refs.some(ref => ref.id == data.id)
  }

  return (
    <DropTarget onDrop={handleDrop} canDrop={canDrop}>
      <article className={"item editable " + item.kind} data-id={item.id}>
        <form onSubmit={handleSubmit}>
          <TopItemFields item={item} data={data} onChange={handleChange} />

          {
            item.kind == 'task' ? <TaskItemFields item={item} data={data} onChange={handleChange} /> :
            item.kind == 'note' ? <NoteItemFields item={item} data={data} onChange={handleChange} /> :
            null
          }

          <BottomItemFields item={item} data={data} onChange={handleChange} />

          {/* References section */}
          { (index.ready && data.refs && data.refs.length > 0) &&
              <ReferenceFields onRemove={handleRemoveRef} index={index} data={data} />
          }

          {/* Footer with buttons */}
          <fieldset className="inline">
            <button type="button" onClick={handleCancel}>Cancel</button>
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
      </select>
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


function ReferenceFields({ index, data, onRemove }) {
  const handleDragOver = (ev) => {
    ev.preventDefault() // necessary for drop to work
  }

  const handleDrop = (ev) => {
    e.preventDefault()

    if (e.dataTransfer.getData('application/x-item-remove')) {
      window._itemDropped = true
    }
  }

  const handleRemove = (item) => {
    onRemove?.({ id: item._id })
  }

  return (
    <fieldset>
      <div className="refs">
        { data.refs.map(ref => 
          index.byId[ref.id] && (
            <RefItem key={ref.id} item={index.byId[ref.id]} onRemove={handleRemove} />
          )
        )}
      </div>
    </fieldset>
  )
}


function formatDatetime(isoString) {
  return isoString ? isoString.slice(0, isoString.lastIndexOf(':')) : ''
}