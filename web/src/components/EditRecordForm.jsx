import { useState } from 'react'
import DropTarget from './DropTarget'
import TinyRecord from './TinyRecord'
import { useStore } from '../store'
import { getTransferData, RefType } from '../utils'
import EditableList from './EditableList'


export default function EditRecordForm({ record, onSave, onCancel, onDelete }) {
  const [data, setData] = useState({ ...record })
  const records = useStore(state => state.records)
  const updateRecord = useStore(state => state.updateRecord)
  const saveRecord = useStore(state => state.saveRecord)

  const handleChange = (name, value) => {
    setData(prev => ({ ...prev, [name]: value }))
  }


  const handleSubmit = (ev) => {
    ev.preventDefault()

    const updatedRecord = {
      ...record,
      ...data,
      title: data.title
    }

    saveRecord.run(updatedRecord)
    onSave?.()
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handleDelete = () => {
    const updatedRecord = {
      ...record,
      deleted: true
    }

    updateRecord.run(updatedRecord)
    onDelete?.()
  }

  const handleRemoveRef = (ref) => {
    setData(prev => ({ ...prev, refs: prev.refs.filter(it => it.id !== ref.id) }))
  }

  const handleSelfDrop = (ev) => {
    const ref = getTransferData(ev, RefType)
    if (!ref) { return }

    const newRefOrder = [...data.refs]

    const prevIndex = newRefOrder.findIndex(it => it.id == ref.id)
    if (prevIndex != -1) {
      newRefOrder.splice(prevIndex, 1)
    }
    newRefOrder.push(ref)
    setData(prev => ({ ...data, refs: newRefOrder }))
  }

  const handleChangeRefs = (newRefOrder) => {
    setData(prev => ({ ...data, refs: newRefOrder }))
  }

  return (
    <DropTarget onDrop={handleSelfDrop}>
      <article>
        <form className={`edit-record ${record.kind}`} data-id={record.id} onSubmit={handleSubmit}>
          <TopRecordFields record={record} data={data} onChange={handleChange} />

          {
            data.kind == 'task' ? <TaskRecordFields record={record} data={data} onChange={handleChange} /> :
              data.kind == 'note' ? <NoteRecordFields record={record} data={data} onChange={handleChange} /> :
                null
          }

          <BottomRecordFields record={record} data={data} onChange={handleChange} />

          {/* References section */}
          { (records.ready && data.refs && data.refs.length > 0) &&
              <ReferenceFields onRemove={handleRemoveRef} records={records} data={data} onChange={handleChangeRefs} />
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


function TopRecordFields({ record, data, onChange }) {
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


function BottomRecordFields({ record, data, onChange }) {
  const changeHandler = (name) => (ev) => { onChange(name, ev.target.value) }

  return (
    <fieldset>
      <textarea value={data.body || ''} onChange={changeHandler('body')} rows={8} />
    </fieldset>
  )
}


function TaskRecordFields({ record, data, onChange }) {
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


function NoteRecordFields({ record, data, onChange }) {
  return null
}


function ReferenceFields({ records, data, onRemove, onDrop, onChange }) {
  const refToChild = (ref) => (
    <TinyRecord record={records.byId[ref.id]} onRemove={onRemove}>
      <button type="button" className="delete action" onClick={() => onRemove(ref)}><i className="cross" /></button>
    </TinyRecord>
  )

  return (
    <fieldset>
      <ol className="refs">
        {data.refs.map(ref =>
          <DropTarget key={ref.id} onDrop={onDrop}>
            <li className="ref">
              <TinyRecord record = {records.byId[ref.id]} />
            </li>
          </DropTarget>
        )}

        <DropTarget onDrop={onDrop}><div className="sentinel" /></DropTarget>
      </ol>
    </fieldset>
  )
}


function formatDatetime(isoString) {
  return isoString ? isoString.slice(0, isoString.lastIndexOf(':')) : ''
}