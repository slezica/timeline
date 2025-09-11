import { html, css } from '../utils.js'

export class AppItemElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._item = null
  }

  connectedCallback() {
    this.render()
  }

  set item(itemData) {
    this._item = itemData
    if (this.shadowRoot) {
      this.render()
    }
  }

  get item() {
    return this._item
  }

  render() {
    if (!this._item) return

    this.shadowRoot.innerHTML = html`
      <style>${styles}</style>
      <div class="item-header">
        <h3 class="item-title">${this._item.title || 'Untitled'}</h3>
        <span class="item-datetime">${new Date(this._item.datetime).toLocaleString()}</span>
      </div>
      <pre class="item-content">${JSON.stringify(this._item, null, 2)}</pre>
      <div class="item-id">ID: ${this._item.id || 'unknown'}</div>
    `
  }

}

const styles = css`
  :host {
    display: block;
    background: white;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 10px;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .item-title {
    font-weight: 600;
    color: #24292f;
    font-size: 16px;
    margin: 0;
  }

  .item-datetime {
    color: #656d76;
    font-size: 12px;
    font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  }

  .item-content {
    margin: 0;
    white-space: pre-wrap;
    font-size: 12px;
    color: #586069;
    font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
    background: #f6f8fa;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #e1e4e8;
    overflow-x: auto;
  }

  .item-id {
    color: #656d76;
    font-size: 10px;
    margin-top: 8px;
    font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  }
`

customElements.define('app-item', AppItemElement)