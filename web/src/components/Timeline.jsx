import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from "react-intersection-observer"
import { useStore } from '../store'
import TimelineItem from './TimelineItem'

const SENTINEL_SPACING = 50


export default function Timeline() {
  const index = useStore(state => state.index)
  const items = useStore(state => state.items)

  const handleSentinelReveal = (position) => {
    if (!index.value) {
      Promise.resolve().then(() => handleSentinelReveal(position))
      return
    }

    const idToFetch = []
    const start = Math.max(position - SENTINEL_SPACING, 0)
    const end = Math.min(position + SENTINEL_SPACING, index.value.entries.length)

    for ( let i = start; i < end; i++) {
      idToFetch.push(index.value.entries[i].itemId)
    }

    items.fetch(idToFetch)
  }

  return (
    <section className="timeline">
      { index.value &&
        index.value.entries.map((entry, i) => [
          <div className="timeline-entry" key={entry.itemId + entry.kind}>
          { items[entry.itemId]
            ? <TimelineItem entry={entry} item={items[entry.itemId]} />
            : <div>placeholder</div>
          }
          </div>,

          (i % SENTINEL_SPACING == 0) &&
            <Sentinel position={i} onFirstReveal={handleSentinelReveal} key={"sentinel" + i} />
        ]
      )}

      {index.loading && (
        <div aria-busy="true">Loading...</div>
      )}

      {index.error && (
        <div role="alert">
        Error: {timeline.error.message || timeline.error}
        <button onClick={handleRetry}>Retry</button>
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