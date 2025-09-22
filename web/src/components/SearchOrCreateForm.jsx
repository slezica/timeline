import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'


export default function SearchOrCreateForm({ onQueryChange, onRequestCreate }) {
  const index = useStore(state => state.index)
  const createItem = useStore(state => state.createItem)
  const [query, setQuery] = useState('')

  const inputRef = useRef()

  useEffect(() => {
    const handleKey = (ev) =>  {
      if (ev.key === '/') {
        ev.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleSearchInput = (ev) => {
    ev.preventDefault()
    const query = ev.target.value

    setQuery(query)
    onQueryChange?.(query)
  }

  const handleSearchSubmit = (ev) => {
    ev.preventDefault()
  }

  const handleCreateSubmit = (ev) => {
    ev.preventDefault()
    onRequestCreate?.()
  }

  return (
    <div className="search-and-create">
      <form className="search" onSubmit={handleSearchSubmit}>
        <fieldset className="inline">
          <input
            type="text"
            value={query}
            onInput={handleSearchInput}
            placeholder="Search"
            ref={inputRef}
          />
        </fieldset>
      </form>

      <form className="create" onSubmit={handleCreateSubmit}>
        <button type="submit"><i className="plus" /></button>
      </form>
    </div>
  )
}

