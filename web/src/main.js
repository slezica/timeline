import './components/AppMainElement.js'
import './components/AppTimelineElement.js'
import './components/AppItemElement.js'
import * as actions from './actions.js'
import { setupInfiniteScroll, retryLoad } from './ui.js'

// Initialize the app
async function init() {
  // Wait for all app elements to be defined and connected
  await customElements.whenDefined('app-main')
  await customElements.whenDefined('app-timeline')
  await customElements.whenDefined('app-item')
  
  setupInfiniteScroll()
  
  // Load initial items
  actions.loadMore()
}

// Make retry function globally available for error retry button
window.retryLoad = retryLoad

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}