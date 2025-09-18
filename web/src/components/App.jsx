import React, { useEffect } from 'react'
import CreateItemForm from './CreateItemForm'
import Timeline from './Timeline'
import './App.css'
import { useStore } from '../store'

export default function App() {
  const store = useStore()
  const index = useStore(state => state.index)

  useEffect(() => {
    store.initialize()
  }, [])

  return (
    <main className="container">
      <CreateItemForm />
      <div className="pinned-items">
        Pinned
      </div>

      <Timeline index={index} />
    </main>
  )
}

