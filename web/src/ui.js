import { state, subscribe } from './state.js'
import * as actions from './actions.js'

// Get the app element instance
function getAppElement() {
  return document.querySelector('app-main')
}

// Subscribe to state changes for reactive UI updates
let previousState = { ...state }

subscribe((newState) => {
  const app = getAppElement()
  if (!app) return

  // Update loading state if changed
  if (newState.loading !== previousState.loading || newState.hasMore !== previousState.hasMore) {
    app.setLoading(newState.loading, newState.hasMore)
  }

  // Update error state if changed
  if (newState.error !== previousState.error) {
    app.setError(newState.error)
  }

  // Add new items if items array changed
  if (newState.items !== previousState.items) {
    const newItems = newState.items.slice(previousState.items.length)
    if (newItems.length > 0) {
      app.appendItems(newItems)
    }
  }

  previousState = { ...newState }
})

// Legacy functions for backwards compatibility (will be removed)
export function appendItems(items) {
  const app = getAppElement()
  if (app) {
    app.appendItems(items)
  }
}

export function setLoading(loading) {
  const app = getAppElement()
  if (app) {
    app.setLoading(loading, state.hasMore)
  }
}

export function setError(error) {
  const app = getAppElement()
  if (app) {
    app.setError(error)
  }
}

// Set up intersection observer for infinite scroll
export function setupInfiniteScroll() {
  const app = getAppElement()
  if (!app) return
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting && !state.loading && state.hasMore) {
        actions.loadMore()
      }
    })
  }, {
    rootMargin: '512px' // Start loading when sentinel is 512px from viewport
  })
  
  observer.observe(app.loadingSentinel)
}

// Retry function for error state
export async function retryLoad() {
  actions.loadMore()
}