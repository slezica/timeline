import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'


export default function CreateItemFormMini({ onItemCreate }) {
  const createItem = useStore(state => state.createItem)
  const shortcutRef = useRef()

  useEffect(() => {
    const handleKey = (ev) => {
      if (ev.key === '+') {
        ev.preventDefault()
        shortcutRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const now = new Date().toISOString()

    try {
      const item = await createItem.run({
        title: "Untitled",
        kind: 'note',
        body: "",
        refs: [],
        createdDate: now,
        updatedDate: now
      })

      onItemCreate?.(item)

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form className="create" onSubmit={handleSubmit} >
      <button type="submit"><i className="plus" /></button>
    </form >
  )
}
