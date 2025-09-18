import React from 'react'

export default function NoteItem({ item, context = 'timeline' }) {
  return (
    <>
      {context === 'shelf' && <strong>{item.title || 'Untitled'}</strong>}

      {item.body && (
        <p>{item.body}</p>
      )}

      {context === 'shelf' && <small>{item.kind}</small>}
    </>
  )
}