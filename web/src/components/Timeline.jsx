import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from "react-intersection-observer"
import { useStore } from '../store'
import LargeItem from './LargeItem'

const SENTINEL_SPACING = 50


export default function Timeline({ timeline, onItemClick }) {
  const [ groups, setGroups ] = useState([])
  const items = useStore(state => state.items)

  useEffect(() => {
    if (!timeline.ready) { return }

    // Merge consecutive same-ID entries, mark entry closest to present:
    const groups = []
    const present = new Date().toISOString()
    let mostRecentEntry = null

    for (let i = timeline.refs.length - 1; i > 0; i--) {
      const entry = timeline.refs[i]
      const lastGroup = groups[groups.length - 1]

      if (entry.date < present) {
        mostRecentEntry = entry
      }

      if (lastGroup && entry.id == lastGroup[0].id) {
        lastGroup.sort()
        lastGroup.push(entry)
      } else {
        groups.push([entry])
      }
    }

    if (mostRecentEntry) {
      mostRecentEntry.isMostRecent = true
    }

    setGroups(groups)

  }, [timeline])

  const handleItemClick = (ref) => {
    onItemClick?.(items.byId[ref])
  }

  const scrollToElement = useCallback((el) => {
    if (el) {
      el.scrollIntoView({ block: 'start', container: 'nearest' })
    }
  }, [])

  return (
    <section className="timeline">
      { groups.map(group => {
        const entry = group[0]
        const key = entry.event + entry.id
        const isMostRecent = group.some(entry => entry.isMostRecent)

        return (
          <div className="timeline-entry" key={key} data-date={group[group.length-1].date}>
            { isMostRecent && <div className="present"><hr />Present<hr /></div> }
            { isMostRecent && <div className="anchor" ref={scrollToElement} /> }

            {items.byId[entry.id]
              ? <LargeItem
                  entries={group}
                  item={items.byId[entry.id]}
                  onClick={onItemClick}
                  onRefClick={onItemClick}
                />
              : <div>placeholder</div>
            }
          </div>
        )
      })}

      {timeline.loading && (
        <div aria-busy="true">Loading...</div>
      )}

      {timeline.error && (
        <div role="alert">
          Error: {timeline.error}
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