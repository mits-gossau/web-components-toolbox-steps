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
    event.detail.fetch.then(
      /** @param {import('../../controllers/events/Events.js').ListFilterItems} data */
      data => this.renderHTML(data))
  }

  shouldRenderCSS () {
    return !this.root.querySelector(
      `:host > style[_css], ${this.tagName} > style[_css]`
    )
  }

  renderCSS () {
    this.css = /* css */ `
      :host {
        --button-steps-filter-margin: 1px;
      }
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

  /**
   * @param {import('../../controllers/events/Events.js').ListFilterItems} data
   */
  renderHTML (data) {
    if (!data || !Array.isArray(data.items)) {
      return Array.from(this.root.querySelectorAll(':host > *:not(style)')).forEach(el => el.classList.add('hidden'))
    }
    let ul
    if (ul = this.root.querySelector(`:host > *.${data.filterType}`)) {
      ul.classList.remove('hidden')
    } else {
      let render = ''
      if (data.filterType === 'accessibility') {
        render = /* html */ `
         <ul class="list-items ${data.filterType}">
          ${data.items.reduce((accumulator, name) => /* html */`
            ${accumulator}
              <li>
                <a-button
                  ${name === data.filterActive ? 'class="active"' : ''} 
                  filter-type="${data.filterType}" 
                  namespace="button-steps-filter-"
                  tag="${name.alt}" 
                  answer-event-name="list-events"
                  active-detail-property-name="fetch:filter:${data.filterType}" 
                  request-event-name="request-list-events">
                    <img src="http://testadmin.steps.ch${name.src}" width="24" height="24" class="accessibility-icon" /> ${name.alt} 
                </a-button>
              </li>`,
            '')
          }
        <ul>`
      } else {
        render = /* html */ `
        <ul class="list-items ${data.filterType}">
          ${Array.from(new Set(
          // @ts-ignore
          data.items
          // @ts-ignore
          )).reduce((accumulator, name) => /* html */`
            ${accumulator}
              <li>
                <a-button
                  ${name === data.filterActive ? 'class="active"' : ''} 
                  filter-type="${data.filterType}" 
                  namespace="button-steps-filter-"
                  tag="${name}" 
                  answer-event-name="list-events"
                  active-detail-property-name="fetch:filter:${data.filterType}" 
                  request-event-name="request-list-events">${name}</a-button></li>`,
            '')}
        <ul>
      `
      }
      this.html = render
    }
    this.root.querySelector(`:host > *:not(.${data.filterType}):not(style)`)?.classList.add('hidden')
    this.dispatchEvent(
      new CustomEvent('request-list-events', {
        bubbles: true,
        cancelable: true,
        composed: true
      })
    )
  }
}
