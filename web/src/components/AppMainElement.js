import { html, css } from '../utils.js'

export class AppMainElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadowRoot.innerHTML = html`
      <style>${styles}</style>
      <div class="container">
        <div class="header">
          <h1>Timeline Garden</h1>
        </div>
        <div class="timeline-wrapper">
          <app-timeline></app-timeline>
          <div class="loading" style="display: none;"></div>
          <div class="error" style="display: none;"></div>
        </div>
      </div>
    `
  }

  get timeline() {
    return this.shadowRoot.querySelector('app-timeline')
  }

  get loadingSentinel() {
    return this.timeline?.loadingSentinel
  }

  get loadingElement() {
    return this.shadowRoot.querySelector('.loading')
  }

  get errorElement() {
    return this.shadowRoot.querySelector('.error')
  }

  appendItems(newItems) {
    const timeline = this.timeline
    if (timeline) {
      timeline.appendItems(newItems)
    }
  }

  setLoading(loading, hasMore = true) {
    const loadingEl = this.loadingElement
    
    if (loading) {
      loadingEl.innerHTML = '<span class="loading-spinner">⟳</span>Loading...'
      loadingEl.style.display = 'block'
    } else if (hasMore) {
      loadingEl.style.display = 'none'
    } else {
      loadingEl.textContent = 'No more items'
      loadingEl.style.display = 'block'
    }
  }

  setError(error) {
    const errorEl = this.errorElement
    
    if (error) {
      errorEl.innerHTML = html`
        Error: ${error.message}
        <button class="retry-button" onclick="window.retryLoad()">Retry</button>
      `
      errorEl.style.display = 'block'
    } else {
      errorEl.style.display = 'none'
    }
  }

}

const styles = css`
  :host {
    display: block;
    width: 100%;
    height: 100vh;
    font-family: system-ui, sans-serif;
    background-color: #fafafa;
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .header {
    text-align: center;
    padding: 20px;
    background: white;
    border-bottom: 1px solid #e1e4e8;
    flex-shrink: 0;
  }

  .header h1 {
    color: #24292f;
    margin: 0;
    font-size: 32px;
    font-weight: 600;
  }

  .timeline-wrapper {
    flex: 1;
    position: relative;
  }

  app-timeline {
    width: 100%;
    height: 100%;
  }

  .loading {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 6px;
    color: #666;
    z-index: 10;
    border: 1px solid #e1e4e8;
  }

  .loading-spinner {
    display: inline-block;
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px;
    color: #cf222e;
    background: #ffebe9;
    border: 1px solid #f85149;
    border-radius: 6px;
    max-width: 600px;
    z-index: 10;
  }

  .retry-button {
    background: #0969da;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    margin-left: 10px;
    font-size: 12px;
  }

  .retry-button:hover {
    background: #0860ca;
  }
`

// Register the custom element
customElements.define('app-main', AppMainElement)