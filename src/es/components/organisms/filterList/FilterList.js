// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

export default class FilterList extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()

    document.body.addEventListener(
      this.getAttribute('answer-event-name') || 'answer-event-name',
      this.answerEventListener
    )
  }

  disconnectedCallback () {
    document.body.removeEventListener(
      this.getAttribute('answer-event-name') || 'answer-event-name',
      this.answerEventListener
    )
  }

  answerEventListener = (event) => {
    event.detail.fetch.then((data) => this.renderHTML(data))
  }

  shouldRenderCSS () {
    return !this.root.querySelector(
      `:host > style[_css], ${this.tagName} > style[_css]`
    )
  }

  renderCSS () {
    this.css = /* css */ `
      :host .list-items {
        list-style: none;
        margin: 1.25rem 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
      :host .hidden {
        display: none;
      }
    `
  }

  renderHTML (data) {
    this.html = ''
    this.html = /* html */`
      <ul class="list-items">
        ${Array.from(new Set(data.items)).map(name => /* html */`
          <li><a-button filter-type="${data.filterType}" namespace="button-category-" tag="${name}" request-event-name="request-list-events">${name}</a-button></li>
        `)}
      <ul>
    `
  }
}
