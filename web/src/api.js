const API_BASE = 'http://localhost:3000'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
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

export function addMs(dateString, ms) {
  const date = new Date(dateString)
  date.setMilliseconds(date.getMilliseconds() + ms)
  return date.toISOString()
}

export async function fetchIndex(order) {
  const params = new URLSearchParams({
    order,
  })

  return apiRequest(`/api/index?${params}`)
}

export async function fetchItems(ids) {
  const params = new URLSearchParams({
    ids: ids.join(',')
  })
  
  return apiRequest(`/api/items?${params}`)
}

export async function createItem({ title, kind, ...extras }) {
  const body = { title, kind, ...extras }
  
  return apiRequest('/api/items', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}