import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from "react-intersection-observer"
import { useStore } from '../store'
import TimelineItem from './TimelineItem'

const SENTINEL_SPACING = 50


export default function Timeline({ index, items }) {
  return (
    <section className="timeline">
      { index.ready &&
        index.list.map((entry, i) => console.log(entry) || [
          <div className="timeline-entry" key={entry.id}>
          { items.dict[entry.id]
            ? <TimelineItem entry={entry} item={items.dict[entry.id]} />
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

function Sentinel({ position, onFirstReveal, onReveal }) {
  const ref = useRef()
  const [revealedOnce, setRevealedOnce] = useState(false)

  useEffect(() => {
    const el = ref.current

    const observer = new IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          if (!entry.isIntersecting) { continue }

          if (!revealedOnce) {
            setRevealedOnce(true)
            onFirstReveal?.(position)
          }

          onReveal?.(position)
          return
        }
      },
      { rootMargin: '1024px' }
    )

    observer.observe(el)
  }, [])

  return <div data-position={position} className="sentinel" ref={ref} />
}