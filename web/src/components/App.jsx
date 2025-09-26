import { useEffect, useState } from 'react'
import { useStore } from '../store'

import Timeline from './Timeline'
import Modal from './Modal'
import EditRecordForm from './EditRecordForm'

import './App.css'
import Shelf from './Shelf'
import { Toolbar } from './Toolbar'
import Desk from './Desk'


export default function App() {
  const store = useStore()
  const timeline = useStore(state => state.timeline)

  const [query, setQuery] = useState("")
  const [queryIndex, setQueryIndex] = useState([])
  const [editingRecord, setEditingRecord] = useState(null)

  useEffect(() => {
    store.initialize()
  }, [])

  useEffect(() => {
    const searchOptions = {
      fuzzy: 0.2,
      boost: { title: 2 },
      prefix: true
    }

    timeline.search(query, searchOptions).then(refs => {
      refs = [...refs]
      refs.sort((a, b) => a.date < b.date)
      setQueryIndex({ ...timeline, refs })
    })

  }, [timeline, query])

  const handleSearch = (query) => {
    setQuery(query)
  }

  const handleModalClose   = () => { setEditingRecord(null) }
  const handleRecordCreate = (record) => { setEditingRecord(record) }
  const handleRecordSave   = (record) => { setEditingRecord(null) }
  const handleRecordClick  = (record) => { setEditingRecord(record) }

  return (
    <div id="app">
      <header>
        <Toolbar onSearch={handleSearch} onRecordCreate={handleRecordCreate} />
      </header>

      <main>
        <aside className="left">
          <Desk />
        </aside>

        <div class="center">
          <Timeline timeline={queryIndex} onRecordClick={handleRecordClick} />
        </div>

        <aside className="right">
          <Shelf />
        </aside>
      </main>

      <footer>
        <Toolbar onSearch={handleSearch} onRecordCreate={handleRecordCreate} />
      </footer>

      <Modal open={editingRecord !== null} onClose={handleModalClose}>
        {editingRecord && (
          <EditRecordForm
            record   = {editingRecord}
            onSave   = {handleRecordSave}
            onCancel = {handleModalClose}
            onDelete = {handleModalClose}
          />
        )}
      </Modal>
    </div>
  )
}

