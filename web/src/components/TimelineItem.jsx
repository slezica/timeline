import React from 'react'

export default function TimelineItem({ item }) {
  return (
    <article>
      <header>
        <h3>{item.title || 'Untitled'}</h3>
        <small>{new Date(item.datetime).toLocaleString()}</small>
      </header>
      <pre><code>{JSON.stringify(item, null, 2)}</code></pre>
      <footer>
        <small>ID: {item.id || 'unknown'}</small>
      </footer>
    </article>
  )
}