import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'


export default function SearchForm({ onQueryChange }) {
  const inputRef = useRef()
  const [query, setQuery] = useState("")

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

  return (
    <form className="search" onSubmit={handleSearchSubmit}>
      <fieldset>
        <input
          type="text"
          value={query}
          onInput={handleSearchInput}
          placeholder="Search"
          ref={inputRef}
        />
      </fieldset>
    </form>
  )
}

