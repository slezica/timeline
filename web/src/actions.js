import { state, updateState } from './state.js'
import { addMs } from './utils.js'

// API configuration
const API_BASE = 'http://localhost:3000'

// Utility function to make authenticated requests
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

// Load more items from the API
export async function loadMore() {
  if (state.loading || !state.hasMore) return
  
  updateState({ loading: true, error: null })
  
  const limit = 20
  
  try {
    const params = new URLSearchParams({
      sort: state.sort,
      order: state.order,
      limit
    })
    
    // Use timestamp of last item + 1ms for pagination
    if (state.items.length > 0) {
      const lastItem = state.items[state.items.length - 1]
      params.append('start', addMs(lastItem.datetime, 1))
    }
    
    const data = await apiRequest(`/api/items?${params}`)
    
    // Update state with new items
    updateState({
      items: [...state.items, ...data.items],
      hasMore: (data.items.length >= limit),
      loading: false
    })
    
  } catch (error) {
    console.error('Failed to load items:', error)
    updateState({ error, loading: false })
  }
}