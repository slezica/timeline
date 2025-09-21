import React from 'react'
import Draggable from './Draggable'


export default function Tag({ icon, name, content }) {

  return (
    <span className="tag">
      { icon && <i className={icon} /> }
      { name && <span className="name">{name}</span> }
      { content && <span className="content">{content}</span> }
    </span>
  )
}
