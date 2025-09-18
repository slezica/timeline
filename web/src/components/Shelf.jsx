import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'


export default function Shelf() {
  const shelf = useStore(state => state.shelf)
  const index = useStore(state => state.index)

  return (
    <section className="shelf">
    { shelf.inOrder.map(entry => 
      <pre>JSON.stringify(entry)</pre>
    ) }
    </section>
  )
}

