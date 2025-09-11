// Global application state
export const state = {
  items: [],
  loading: false,
  hasMore: true,
  sort: 'created',
  order: 'desc',
  error: null
}

// Subscription system for reactive updates
const subscribers = []

export function subscribe(callback) {
  subscribers.push(callback)
  
  // Return unsubscribe function
  return () => {
    const index = subscribers.indexOf(callback)
    if (index > -1) {
      subscribers.splice(index, 1)
    }
  }
}

function notifySubscribers() {
  subscribers.forEach(callback => {
    try {
      callback(state)
    } catch (error) {
      console.error('Error in state subscriber:', error)
    }
  })
}

export function updateState(updates) {
  let hasChanges = false
  
  for (const [key, value] of Object.entries(updates)) {
    if (state[key] !== value) {
      state[key] = value
      hasChanges = true
    }
  }
  
  if (hasChanges) {
    notifySubscribers()
  }
}