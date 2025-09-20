import React, { useState } from 'react'
import SmallItem from './SmallItem'
import DropTarget from './DropTarget'




export default function EditableItem({ index, item, onSave, onCancel }) {
  const [data, setData] = useState({
    title: item.title || '',
    body: item.body || '',
    kind: item.kind,
    dueDate: item.dueDate || '',
    doneDate: item.doneDate || '',
    refs: item.refs || []
  })

  const handleChange = (name, value) => {
    setData(prev => ({ ...prev, [name]: value }))
  }

  const changeHandler = (name) => (ev) => { handleChange(name, ev.target.value) }

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

  const handleRemoveRef = (refId) => {
    setData(prev => ({
      ...prev,
      refs: prev.refs.filter(ref => ref.id !== refId)
    }))
  }

  const handleItemDrop = (itemId, item) => {
    setData(prev => ({
      ...prev,
      refs: [...(prev.refs || []), { id: itemId }]
    }))
  }

  return (
    <DropTarget item={{...item, refs: data.refs}} onItemDrop={handleItemDrop}>
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
              <ReferenceFields index={index} data={data} />
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
    <fieldset class="inline">
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

  const removeHandler = (ref) => (ev) => {
    onRemove?.(ref)
  }

  return (
    <fieldset>
      <div className="item-refs">
        { data.refs.map(ref => 
          index.byId[ref.id] && (
            <div class="removable">
              <span class="remove" onClick={removeHandler(ref)}>X</span>
              <SmallItem key={ref.id} item={index.byId[ref.id]} />
            </div>
          )
        )}
      </div>
    </fieldset>
  )
}


function formatDatetime(isoString) {
  return isoString ? isoString.slice(0, isoString.lastIndexOf(':')) : ''
}