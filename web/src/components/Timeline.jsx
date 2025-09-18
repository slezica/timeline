import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from "react-intersection-observer"
import { useStore } from '../store'
import TimelineEntry from './TimelineEntry'

const SENTINEL_SPACING = 50


export default function Timeline({ index }) {
  const [ groups, setGroups ] = useState([])

  useEffect(() => {
    if (!index.ready) { return }

    // Merge consecutive same-ID entries:
    const groups = []

    for (let entry of index.inOrder) {
      const lastGroup = groups[groups.length - 1]

      if (lastGroup && entry.id == lastGroup[0].id) {
        lastGroup.push(entry)
      } else {
        groups.push([entry])
      }
    }

    setGroups(groups)
  }, [index])


  return (
    <section className="timeline">
      { groups.map(group => [
          <div className="timeline-entry" key={group[0].id}>
          { index.byId[group[0].id]
            ? <TimelineEntry group={group} item={index.byId[group[0].id]} />
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