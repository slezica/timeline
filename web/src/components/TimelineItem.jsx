import React from 'react'

function NoteItem({ entry, item }) {
  return (
    <article className="item note">
      <header>
        <h3>{item.title || 'Untitled'}</h3>
        <small>{new Date(entry.date).toLocaleString()}</small>
      </header>
      <pre><code>{JSON.stringify(item, null, 2)}</code></pre>
      <footer>
        <small>Note • ID: {item.id || 'unknown'}</small>
      </footer>
    </article>
  )
}

function TaskItem({ entry, item }) {
  return (
    <article className="item task">
      <header>
        <h3>
          <input type="checkbox" disabled /> {item.title || 'Untitled'}
        </h3>
        <small>{new Date(entry.date).toLocaleString()}</small>
      </header>
      <pre><code>{JSON.stringify(item, null, 2)}</code></pre>
      <footer>
        <small>Task • ID: {item.id || 'unknown'}</small>
      </footer>
    </article>
  )
}

export default function TimelineItem({ entry, item }) {
  if (item.kind === 'task') {
    return <TaskItem entry={entry} item={item} />
  } else {
    return <NoteItem entry={entry} item={item} />
  }
}