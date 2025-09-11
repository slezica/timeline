import React from 'react'
import Timeline from './Timeline'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <div className="header">
        <h1>Timeline Garden</h1>
      </div>
      <div className="timeline-wrapper">
        <Timeline />
      </div>
    </div>
  )
}