import React from 'react'
import CreateItemForm from './CreateItemForm'
import Timeline from './Timeline'
import './App.css'

export default function App() {
  return (
    <main className="container">
      <CreateItemForm />
      <Timeline />
    </main>
  )
}