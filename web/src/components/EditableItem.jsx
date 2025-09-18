import React, { useState } from 'react'

function formatDatetime(str) {
  return str.slice(0, str.lastIndexOf(':'))
}

function TaskItemExtras({ item, formData, setFormData }) {
  const handleDueDateChange = (e) => {
    setFormData(prev => ({ ...prev, dueDate: e.target.value }))
  }

  const handleDoneDateChange = (e) => {
    setFormData(prev => ({ ...prev, doneDate: e.target.value }))
  }

  const dueDate = formData.dueDate ? formatDatetime(formData.dueDate) : ''
  const doneDate = formData.doneDate ? formatDatetime(formData.doneDate) : ''

  return (
    <fieldset className="inline">
      <label>
        Due Date
        <input
          type="datetime-local"
          value={dueDate}
          onChange={handleDueDateChange}
        />
      </label>
      <label>
        Done Date
        <input
          type="datetime-local"
          value={doneDate}
          onChange={handleDoneDateChange}
        />
      </label>
    </fieldset>
  )
}

function NoteItemExtras({ item, formData, setFormData }) {
  return null
}

export default function EditableItem({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: item.title || '',
    body: item.body || '',
    kind: item.kind,
    dueDate: item.dueDate || '',
    doneDate: item.doneDate || ''
  })

  const handleSave = () => {
    const updatedItem = {
      ...item,
      ...formData,
      title: formData.title || 'Untitled'
    }
    onSave(updatedItem)
  }

  const renderItemExtras = () => {
    switch (item.kind) {
      case 'task':
        return <TaskItemExtras item={item} formData={formData} setFormData={setFormData} />
      case 'note':
        return <NoteItemExtras item={item} formData={formData} setFormData={setFormData} />
      default:
        return <p>Unknown item type: {item.kind}</p>
    }
  }

  return (
    <article className={"item editable " + item.kind}>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* Header */}
        <label>
          Title
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Untitled"
          />
        </label>

        <label>
          Type
          <select
            value={formData.kind}
            onChange={(e) => setFormData(prev => ({ ...prev, kind: e.target.value }))}
          >
            <option value="task">Task</option>
            <option value="note">Note</option>
          </select>
        </label>

        {/* Type-specific extras */}
        {renderItemExtras()}

        {/* Universal body field */}
        <label>
          Body
          <textarea
            value={formData.body || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
            rows={4}
          />
        </label>

        {/* Footer with buttons */}
        <fieldset className="inline">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit">Save</button>
        </fieldset>
      </form>
    </article>
  )
}