import React, { useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loadMoreItems } from '../store/actions'
import { 
  selectItems, 
  selectLoadingState, 
  selectCanLoadMore 
} from '../store/selectors'
import TimelineItem from './TimelineItem'

export default function Timeline() {
  const dispatch = useDispatch()
  const items = useSelector(selectItems)
  const { loading, hasMore, error } = useSelector(selectLoadingState)
  const canLoadMore = useSelector(selectCanLoadMore)
  const sentinelRef = useRef(null)

  const handleLoadMore = useCallback(() => {
    dispatch(loadMoreItems())
  }, [dispatch])

  const handleRetry = useCallback(() => {
    handleLoadMore()
  }, [handleLoadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!canLoadMore) return
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
  }, [canLoadMore, handleLoadMore])

  // Load initial items
  useEffect(() => {
    if (items.length === 0 && !loading) {
      handleLoadMore()
    }
  }, [items.length, loading, handleLoadMore])

  return (
    <div className="timeline-container">
      <div className="items-container">
        {items.map((item, index) => (
          <TimelineItem key={`${item.id}-${index}`} item={item} />
        ))}
      </div>
      
      <div ref={sentinelRef} className="loading-sentinel" />
      
      {loading && (
        <div className="loading">
          <span className="loading-spinner">⟳</span>
          Loading...
        </div>
      )}
      
      {error && (
        <div className="error">
          Error: {error}
          <button className="retry-button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}
      
      {!hasMore && !loading && (
        <div className="end-message">No more items</div>
      )}
    </div>
  )
}