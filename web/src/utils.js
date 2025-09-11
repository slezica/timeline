// HTML escaping utility
export function escapeHtml(text) {
  if (text == null) return ''
  const div = document.createElement('div')
  div.textContent = String(text)
  return div.innerHTML
}

// Template functions for syntax highlighting with auto-escaping
export const css = (strings, ...values) => {
  return strings.reduce((result, string, i) => {
    return result + string + (values[i] || '')
  }, '')
}

export const html = (strings, ...values) => {
  return strings.reduce((result, string, i) => {
    const value = values[i]
    const escapedValue = value != null ? escapeHtml(value) : ''
    return result + string + escapedValue
  }, '')
}

// Utility function to increment datetime by specified milliseconds
export function addMs(dateString, ms) {
  const date = new Date(dateString)
  date.setMilliseconds(date.getMilliseconds() + ms)
  return date.toISOString()
}