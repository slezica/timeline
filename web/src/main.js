// Global state management
const state = {
  items: [],
  loading: false,
  hasMore: true,
  sort: 'created',
  order: 'desc',
  error: null
}

// Utility function to increment datetime by 1 millisecond
function addMs(dateString, ms) {
  const date = new Date(dateString)
  date.setMilliseconds(date.getMilliseconds() + ms)
  return date.toISOString()
}

// DOM elements
const itemsContainer = document.getElementById('items-container')
const loadingSentinel = document.getElementById('loading-sentinel')
const endMessage = document.getElementById('end-message')

// API configuration
const API_BASE = 'http://localhost:3000'

// Utility function to make authenticated requests
async function apiRequest(path, options = {}) {
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

// Render a single item as JSON
function renderItem(item) {
  const itemElement = document.createElement('div')
  itemElement.className = 'item'
  itemElement.innerHTML = `<pre>${JSON.stringify(item, null, 2)}</pre>`
  return itemElement
}

// Add items to the container
function appendItems(items) {
  const fragment = document.createDocumentFragment()
  items.forEach(item => {
    fragment.appendChild(renderItem(item))
  })
  itemsContainer.appendChild(fragment)
}

// Update loading state
function setLoading(loading) {
  state.loading = loading
  if (loading) {
    loadingSentinel.style.display = 'block'
    endMessage.style.display = 'none'
  } else if (!state.hasMore) {
    loadingSentinel.style.display = 'none'
    endMessage.style.display = 'block'
  }
}

// Update error state
function setError(error) {
  state.error = error
  if (error) {
    loadingSentinel.innerHTML = `
      <div style="color: red;">
        Error: ${error.message}
        <button onclick="loadMore()" style="margin-left: 10px;">Retry</button>
      </div>
    `
  } else {
    loadingSentinel.innerHTML = `
      <div class="loading-spinner">⟳</div>
      Loading...
    `
  }
}

// Load more items from the API
async function loadMore() {
  if (state.loading || !state.hasMore) return

  setLoading(true)
  setError(null)

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
    
    // Update state
    state.items.push(...data.items)
    state.hasMore = (data.items.length >= limit)
    
    // Render new items
    appendItems(data.items)
    
  } catch (error) {
    console.error('Failed to load items:', error)
    setError(error)
  } finally {
    setLoading(false)
  }
}

// Set up intersection observer for infinite scroll
function setupInfiniteScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !state.loading && state.hasMore) {
        loadMore()
      }
    })
  }, {
    rootMargin: '512px'
  })
  
  observer.observe(loadingSentinel)
}

// Initialize the app
async function init() {
  setupInfiniteScroll()
  
  // Load initial items
  await loadMore()
}

// Make loadMore globally available for retry button
window.loadMore = loadMore

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}