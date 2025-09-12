import React from 'react'

export default function TimelineItem({ item }) {
  return (
    <article class="item">
      <header>
        <h3>{item.title || 'Untitled'}</h3>
        <date>{new Date(item.datetime).toLocaleString()}</date>
      </header>
      <pre><code>{JSON.stringify(item, null, 2)}</code></pre>
      <footer>
        <small>ID: {item.id || 'unknown'}</small>
      </footer>
    </article>
  )
}