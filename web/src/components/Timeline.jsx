import React, { useEffect, useRef } from 'react'
import { useStore } from '../store'
import TimelineItem from './TimelineItem'

export default function Timeline() {
  const timeline = useStore(state => state.timeline)
  const sentinelRef = useRef(null)

  const handleLoadMore = () => {
    timeline.loadMore()
  }

  const handleRetry = () => {
    handleLoadMore()
  }

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (timeline.loading) return
        for (let entry of entries) {
          if (entry.isIntersecting) { handleLoadMore() }
        }
      },
      { rootMargin: '1024px' }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [timeline.loading, handleLoadMore])

  // Load initial items
  useEffect(() => {
    if (timeline.items.length === 0 && !timeline.loading) {
      handleLoadMore()
    }
  }, [timeline.items.length, timeline.loading, handleLoadMore])

  return (
    <section>
      {timeline.items.map((item, index) => (
        <TimelineItem key={`${item.id}-${index}`} item={item} />
      ))}
      
      <div ref={sentinelRef} />
      
      {timeline.loading && (
        <div aria-busy="true">Loading...</div>
      )}
      
      {timeline.error && (
        <div role="alert">
          Error: {timeline.error.message || timeline.error}
          <button onClick={handleRetry}>Retry</button>
        </div>
      )}
      
      {timeline.total !== null && timeline.items.length >= timeline.total && !timeline.loading && (
        <p><em>No more items</em></p>
      )}
    </section>
  )
}