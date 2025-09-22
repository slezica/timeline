import React, { useEffect, useState } from 'react'
import { useStore } from '../store'

import CreateItemForm from './CreateItemForm'
import Timeline from './Timeline'
import SearchOrCreateForm from './SearchForm'
import Modal from './Modal'
import EditableItem from './EditableItem'

import './App.css'
import Shelf from './Shelf'
import DropTarget from './DropTarget'
import ImportFileForm from './ImportFileForm'
import { Toolbar } from './Toolbar'


export default function App() {
  const store = useStore()
  const index = useStore(state => state.index)
  const createItem = useStore(state => state.createItem)

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

  const handleItemEdit = (item) => {
    setEditingItem(item)
  }

  const handleModalClose = () => {
    setEditingItem(null)
  }

  const handleItemSave = (updatedItem) => {
    store.updateItem.run(updatedItem)
    setEditingItem(null)
  }

  return (
    <div id="app">
      <header>
        <Toolbar onSearch={handleSearch} onEdit={handleItemEdit} />
      </header>

      <main>
        <Timeline index={queryIndex} onItemClick={handleItemClick} />
      </main>

      <aside class="right">
        <Shelf onItemClick={handleItemClick} />
      </aside>

      <Modal showing={editingItem !== null} onClose={handleModalClose}>
        {editingItem && (
          <EditableItem
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

