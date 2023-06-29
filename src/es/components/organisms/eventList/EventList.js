// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'
import(
  '../../molecules/eventCard/EventCard.js'
  // @ts-ignore
).then((module) => customElements.define('m-steps-event-card', module.default))

/**
 * EventList
 * An example at: src/es/components/pages/Spielplan.html
 *
 * @export
 * @class EventList
 * @type {CustomElementConstructor}
 */

export default class EventList extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.events = []
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    const jsonUrl = this.getAttribute('json-url')
    // @ts-ignore
    fetch(jsonUrl)
      .then((response) => response.json())
      .then((data) => {
        this.events = data
        this.renderHTML()
      })
      .catch((error) => {
        console.error(error)
      })
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderCSS () {
    this.css = /* css */`
      :host {
        --button-secondary-width: 100%;
        --button-secondary-font-size: 1rem;
      }
      :host .event-list {
        margin: 1.25rem 0;
      }
    `
  }

  renderHTML () {
    const eventHtml = this.events.map(item => /* html */`
      <m-steps-event-card 
        choreographer="${item.event.choreographer}"
        company="${item.event.company}"
        eventIcons='${JSON.stringify(item.event.icons)}'
        location="${item.location.name}"
        locationIcons='${JSON.stringify(item.location.icons)}'
        locationSubline="${item.location.subline}"
        production="${item.event.production}"
        textButtonTickets="${item.translationTexts.buttonTickets}"
        textLinkDetails="${item.translationTexts.linkDetails}"
        textSoldOut="${item.translationTexts.soldOut}"
        textTimeSuffix="${item.translationTexts.timeSuffix}"
        timestamp="${item.event.timestamp}"
      ></m-steps-event-card>`).join('');

    this.html = /* html */ `
      <div class="event-list">
        ${eventHtml}
      </div>
    `
  }
}
