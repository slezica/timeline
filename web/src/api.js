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

export async function fetchItems(
  sort = 'created',
  order = 'desc',
  limit = 20,
  start
) {
  const params = new URLSearchParams({
    sort,
    order,
    limit: limit.toString()
  })
  
  if (start) {
    params.append('start', start)
  }
  
  return apiRequest(`/api/items?${params}`)
}