import React, { useEffect, useState } from 'react'
import { useStore } from '../store'

import CreateItemForm from './CreateItemForm'
import Timeline from './Timeline'
import SearchForm from './SearchForm'
import Modal from './Modal'
import EditableItem from './EditableItem'

import './App.css'
import Shelf from './Shelf'
import ImportFileForm from './ImportFileForm'


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
    const onDragStart = (ev) => { ev.target.classList.add('dragging') }
    const onDragEnd   = (ev) => { ev.target.classList.remove('dragging') }
    const onDragEnter = (ev) => { ev.target.classList.add('dragover') }
    const onDragLeave = (ev) => { ev.target.classList.remove('dragover') }
    const onDrop      = (ev) => { ev.target.classList.remove('dragover') }

    document.addEventListener('dragstart', onDragStart, true)
    document.addEventListener('dragend', onDragEnd, true)
    document.addEventListener('dragenter', onDragEnter, true)
    document.addEventListener('dragleave', onDragLeave, true)
    document.addEventListener('drop', onDrop, true)

    return () => {
      document.removeEventListener('dragstart', onDragStart)
      document.removeEventListener('dragend', onDragEnd)
      document.removeEventListener('dragenter', onDragEnter)
      document.removeEventListener('dragleave', onDragLeave)
      document.removeEventListener('drop', onDrop)
    }
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

  return (
    <div id="app">
      <aside>
        <SearchForm onQueryChange={setQuery} />
        <hr />
        <CreateItemForm />
        <hr />
        <ImportFileForm />
      </aside>

      <main>
        <Timeline index={queryIndex} onItemClick={handleItemClick} />
      </main>

      <aside>
        <Shelf onItemClick={handleItemClick} />
        <div className="expand" />
        <div>hola</div>
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

