import { useEffect, useState } from 'react'
import { useStore } from '../store'

import Timeline from './Timeline'
import Modal from './Modal'
import EditRecordForm from './EditRecordForm'

import './App.css'
import Shelf from './Shelf'
import { TopBar } from './TopBar'
import Desk from './Desk'
import { BottomBar } from './BottomBar'


export default function App() {
  const store = useStore()
  const timeline = useStore(state => state.timeline)

  const [query, setQuery] = useState("")
  const [queryIndex, setQueryIndex] = useState([])
  const [editingRecord, setEditingRecord] = useState(null)

  const [isLeftOpen, setLeftOpen] = useState(false)
  const [isRightOpen, setRightOpen] = useState(false)

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

  const handleToggleLeft = () => {
    setLeftOpen(!isLeftOpen)
  }

  const handleToggleRight = () => {
    setRightOpen(!isRightOpen)
  }

  const handleModalClose   = () => { setEditingRecord(null) }
  const handleRecordCreate = (record) => { setEditingRecord(record) }
  const handleRecordSave   = (record) => { setEditingRecord(null) }
  const handleRecordClick  = (record) => { setEditingRecord(record) }

  return (
    <div id="app">
      <header>
        <TopBar onSearch={handleSearch} onRecordCreate={handleRecordCreate} />
      </header>

      <main>
        <aside className={`left ${isLeftOpen ? '' : 'closed'}`}>
          <Desk />
        </aside>

        <div className="center">
          <Timeline timeline={queryIndex} onRecordClick={handleRecordClick} />
        </div>

        <aside className={`right ${isRightOpen ? '' : 'closed'}`}>
          <Shelf />
        </aside>
      </main>

      <footer>
        <BottomBar
          onToggleLeft  = {handleToggleLeft}
          onToggleRight = {handleToggleRight}
        />
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

