import React, { useEffect, useState } from 'react'
import { useStore } from '../store'

import CreateItemForm from './CreateItemForm'
import Timeline from './Timeline'
import SearchForm from './SearchForm'
import Modal from './Modal'
import EditableItem from './EditableItem'

import './App.css'
import Shelf from './Shelf'
import DropTarget from './DropTarget'


export default function App() {
  const store = useStore()
  const index = useStore(state => state.index)

  const [query, setQuery] = useState("")
  const [queryIndex, setQueryIndex] = useState([])
  const [editingItem, setEditingItem] = useState(null)

  const handleQueryChange = (query) => {
    setQuery(query)
  }

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
      setQueryIndex({ ...index, inOrder })
    })

  }, [index, query])

  const handleItemClick = (item) => {
    setEditingItem(item)
  }

  const handleModalClose = () => {
    setEditingItem(null)
  }

  const handleItemSave = (updatedItem) => {
    store.updateItem.run(updatedItem)
    setEditingItem(null)
  }

  const canDropFile = (data) => {
    // Accept file drops but reject item drops
    return Array.isArray(data) // file drops are arrays of File objects
  }

  const handleFileDrop = (files) => {
    if (files && files.length > 0) {
      const file = files[0]
      console.log('File dropped:', file.name)
      // TODO: handle file import
    }
  }

  return (
    <DropTarget canDrop={canDropFile} onDrop={handleFileDrop}>
      <main className="container">
        <aside className="left sidebar">
          <SearchForm onQueryChange={setQuery} />
          <hr />
          <CreateItemForm />
        </aside>

        <aside className="right sidebar">
          <Shelf onItemClick={handleItemClick} />
        </aside>

        <Timeline index={queryIndex} onItemClick={handleItemClick} />

        <Modal showing={editingItem !== null} onClose={handleModalClose}>
          {editingItem && (
            <EditableItem
              item={editingItem}
              onSave={handleItemSave}
              onCancel={handleModalClose}
              index={index}
            />
          )}
        </Modal>
      </main>
    </DropTarget>
  )
}

