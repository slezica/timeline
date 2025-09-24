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

  const handleKeyDown = (ev) => {
    ev.preventDefault()

    if (ev.key === 'Escape') {
      ev.target.blur()
    }
  }

  const handleInput = (ev) => {
    ev.preventDefault()
    const query = ev.target.value

    setQuery(query)
    onQueryChange?.(query)
  }

  const handleSearchSubmit = (ev) => {
    ev.preventDefault()
  }

  return (
    <SearchFormView
      query={query}
      inputRef={inputRef}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onSubmit={handleSearchSubmit}
    />
  )
}


function SearchFormView({ query, inputRef, onInput, onKeyDown, onSubmit }) {
  return (
    <form className="search" onSubmit={onSubmit}>
      <fieldset>
        <input
          type="text"
          value={query}
          onInput={onInput}
          onKeyDown={onKeyDown}
          placeholder="Search"
          ref={inputRef}
        />
      </fieldset>
    </form>
  )
}

