import React, { useEffect, useState } from 'react'
import { useStore } from '../store'

import Timeline from './Timeline'
import SearchOrCreateForm from './SearchForm'
import Modal from './Modal'
import EditItemForm from './EditItemForm'

import './App.css'
import Shelf from './Shelf'
import DropTarget from './DropTarget'
import ImportFileForm from './ImportFileForm'
import { Toolbar } from './Toolbar'


export default function App() {
  const store = useStore()
  const index = useStore(state => state.index)

  const [query, setQuery] = useState("")
  const [queryIndex, setQueryIndex] = useState([])
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    store.initialize()
  }, [])

  useEffect(() => {
    const searchOptions = {
      fuzzy: 0.2,
      boost: { title: 2 },
      prefix: true
    }

    index.search(query, searchOptions).then(inOrder => {
      inOrder.sort((a, b) => a.date < b.date)
      setQueryIndex({ ...index, inOrder })
    })

  }, [index, query])

  const handleItemClick = (item) => {
    setEditingItem(item)
  }

  const handleSearch = (query) => {
    setQuery(query)
  }

  const handleItemCreate = (item) => {
    setEditingItem(item)
  }

  const handleModalClose = () => {
    setEditingItem(null)
  }

  const handleItemSave = (item) => {
    setEditingItem(null)
  }

  return (
    <div id="app">
      <header>
        <Toolbar onSearch={handleSearch} onItemCreate={handleItemCreate} />
      </header>

      <main>
        <Timeline index={queryIndex} onItemClick={handleItemClick} />
      </main>

      <aside class="right">
        <Shelf onItemClick={handleItemClick} />
      </aside>

      <Modal showing={editingItem !== null} onClose={handleModalClose}>
        {editingItem && (
          <EditItemForm
            item={editingItem}
            onSave={handleItemSave}
            onCancel={handleModalClose}
            onDelete={handleModalClose}
          />
        )}
      </Modal>
    </div>
  )
}

