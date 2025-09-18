import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from "react-intersection-observer"
import { useStore } from '../store'
import TimelineEntry from './TimelineEntry'

const SENTINEL_SPACING = 50


export default function Timeline({ index }) {
  return (
    <section className="timeline">
      { index.ready &&
        index.inOrder.map(entry => [
          <div className="timeline-entry" key={entry.id}>
          { index.byId[entry.id]
            ? <TimelineEntry entry={entry} item={index.byId[entry.id]} />
            : <div>placeholder</div>
          }
          </div>,
        ]
      )}

      {index.loading && (
        <div aria-busy="true">Loading...</div>
      )}

      {index.error && (
        <div role="alert">
        Error: {index.error}
        </div>
      )}
    </section>
  )
}

// function Sentinel({ position, onFirstReveal, onReveal }) {
//   const ref = useRef()
//   const [revealedOnce, setRevealedOnce] = useState(false)
//
//   useEffect(() => {
//     const el = ref.current
//
//     const observer = new IntersectionObserver(
//       (entries) => {
//         for (let entry of entries) {
//           if (!entry.isIntersecting) { continue }
//
//           if (!revealedOnce) {
//             setRevealedOnce(true)
//             onFirstReveal?.(position)
//           }
//
//           onReveal?.(position)
//           return
//         }
//       },
//       { rootMargin: '1024px' }
//     )
//
//     observer.observe(el)
//   }, [])
//
//   return <div data-position={position} className="sentinel" ref={ref} />
// }