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

  const canNeverDrop = () => {
    return false // catch drag-and-drops to nowhere, consider them invalid
  }

  return (
    <div id="app">
      <aside>
        <SearchForm onQueryChange={setQuery} />
        <hr />
        <CreateItemForm />
      </aside>

      <main>
        <Timeline index={queryIndex} onItemClick={handleItemClick} />
      </main>

      <aside>
        <Shelf onItemClick={handleItemClick} />
      </aside>

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
    </div>
  )
}

