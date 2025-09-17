import React, { useEffect } from 'react'
import CreateItemForm from './CreateItemForm'
import Timeline from './Timeline'
import './App.css'
import { useStore } from '../store'

export default function App() {
  const store = useStore()
  const index = useStore(state => state.index)
  const items = useStore(state => state.items)

  useEffect(() => {
    store.initialize()
      .then(() => {
        index.fetch()
        items.fetch()
      })
  }, [])

  return (
    <main className="container">
      {/* <CreateItemForm /> */}
      <div className="pinned-items">
        Pinned
      </div>

      <Timeline index={index} items={items} />
    </main>
  )
}

