import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'


export default function SearchForm({ onQueryChange }) {
  const index = useStore(state => state.index)
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

  const handleInput = async (ev) => {
    ev.preventDefault()
    const query = ev.target.value

    setQuery(query)
    onQueryChange?.(query)
  }

  return (
    <form className="search" onSubmit={handleInput}>
      <fieldset>
        <input
          type="text"
          value={query}
          onInput={handleInput}
          placeholder="Search"
          ref={inputRef}
        />
      </fieldset>
    </form>
  )
}

