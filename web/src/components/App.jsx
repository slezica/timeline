import React from 'react'
import CreateItemForm from './CreateItemForm'
import Timeline from './Timeline'
import Index from './Index'
import './App.css'

export default function App() {
  return (
    <main className="container">
      <CreateItemForm />
      <Index />
    </main>
  )
}