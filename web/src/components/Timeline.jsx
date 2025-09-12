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
    <div className="timeline">
      <div className="items-container">
        {timeline.items.map((item, index) => (
          <TimelineItem key={`${item.id}-${index}`} item={item} />
        ))}
      </div>
      
      <div ref={sentinelRef} className="loading-sentinel" />
      
      {timeline.loading && (
        <div className="loading">
          <span className="loading-spinner">⟳</span>
          Loading...
        </div>
      )}
      
      {timeline.error && (
        <div className="error">
          Error: {timeline.error.message || timeline.error}
          <button className="retry-button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}
      
      {timeline.total !== null && timeline.items.length >= timeline.total && !timeline.loading && (
        <div className="end-message">No more items</div>
      )}
    </div>
  )
}