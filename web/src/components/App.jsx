import React from 'react'
import CreateItemForm from './CreateItemForm'
import Timeline from './Timeline'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <div className="timeline-wrapper">
        <CreateItemForm />
        <Timeline />
      </div>
    </div>
  )
}