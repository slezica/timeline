import React from 'react'

function NoteItem({ item }) {
  return (
    <article className="item note">
      <header>
        <h3>{item.title || 'Untitled'}</h3>
        <small>{new Date(item.datetime).toLocaleString()}</small>
      </header>
      <pre><code>{JSON.stringify(item, null, 2)}</code></pre>
      <footer>
        <small>Note • ID: {item.id || 'unknown'}</small>
      </footer>
    </article>
  )
}

function TaskItem({ item }) {
  return (
    <article className="item task">
      <header>
        <h3>
          <input type="checkbox" disabled /> {item.title || 'Untitled'}
        </h3>
        <small>{new Date(item.datetime).toLocaleString()}</small>
      </header>
      <pre><code>{JSON.stringify(item, null, 2)}</code></pre>
      <footer>
        <small>Task • ID: {item.id || 'unknown'}</small>
      </footer>
    </article>
  )
}

export default function TimelineItem({ item }) {
  if (item.kind === 'task') {
    return <TaskItem item={item} />
  } else {
    return <NoteItem item={item} />
  }
}