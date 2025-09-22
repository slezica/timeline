import React from 'react'
import Draggable from './Draggable'


export default function Tag({ icon, name, children }) {

  return (
    <span className="tag">
      { icon && <i className={icon} /> }
      { name && <span className="name">{name}</span> }
      { children && <span className="content">{children}</span> }
    </span>
  )
}
