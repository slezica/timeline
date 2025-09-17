import React, { useEffect } from 'react'
import CreateItemForm from './CreateItemForm'
import Timeline from './Timeline'
import './App.css'
import { useStore } from '../store'

export default function App() {
  const index = useStore(state => state.index)

  useEffect(() => {
    index.fetch()
  }, [])

  return (
    <main className="container">
      <CreateItemForm />
      <Timeline />
      <div className="pinned">
        Pinned
      </div>
    </main>
  )
}