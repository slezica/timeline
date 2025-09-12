import React from 'react'

export default function TimelineItem({ item }) {
  return (
    <article className="item">
      <div className="item-header">
        <h3 className="item-title">{item.title || 'Untitled'}</h3>
        <span className="item-datetime">
          {new Date(item.datetime).toLocaleString()}
        </span>
      </div>
      <pre className="item-content">
        {JSON.stringify(item, null, 2)}
      </pre>
      <div className="item-id">ID: {item.id || 'unknown'}</div>
    </article>
  )
}