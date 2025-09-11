import { html, css } from '../utils.js'

export class AppTimelineElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.items = []
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadowRoot.innerHTML = html`
      <style>${styles}</style>
      <div class="timeline-container">
        <div class="items-container"></div>
        <div class="loading-sentinel"></div>
      </div>
    `
  }

  get itemsContainer() {
    return this.shadowRoot.querySelector('.items-container')
  }

  get loadingSentinel() {
    return this.shadowRoot.querySelector('.loading-sentinel')
  }

  appendItems(newItems) {
    const container = this.itemsContainer
    
    newItems.forEach(item => {
      const itemElement = document.createElement('app-item')
      itemElement.item = item
      container.appendChild(itemElement)
    })
    
    this.items.push(...newItems)
  }

  clearItems() {
    this.items = []
    const container = this.itemsContainer
    if (container) {
      container.innerHTML = ''
    }
  }

}

const styles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  .timeline-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }

  .loading-sentinel {
    height: 1px;
    margin: 20px 0;
  }
`

customElements.define('app-timeline', AppTimelineElement)