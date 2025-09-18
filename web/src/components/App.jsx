import React, { useEffect, useState } from 'react'
import { useStore } from '../store'

import CreateItemForm from './CreateItemForm'
import Timeline from './Timeline'
import SearchForm from './SearchForm'

import './App.css'
import Shelf from './Shelf'


export default function App() {
  const store = useStore()
  const index = useStore(state => state.index)

  const [query, setQuery] = useState("")
  const [queryIndex, setQueryIndex] = useState([])

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

  return (
    <main className="container">
      <aside className="left sidebar">
        <SearchForm onQueryChange={setQuery} />
        <hr />
        <CreateItemForm />
      </aside>

      <aside className="right sidebar">
        <Shelf />
      </aside>

      <Timeline index={queryIndex} />
    </main>
  )
}

