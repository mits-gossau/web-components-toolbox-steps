// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

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
    /**
     * @typedef {Object} Translations
     * @property {string} buttonTickets - The translation for the "Tickets" button.
     * @property {string} linkDetails - The translation for the "Mehr Details" link.
     * @property {string} soldOut - The translation for the "ausverkauft" message indicating sold-out status.
     * @property {string} timeSuffix - The translation for the suffix added to time values, e.g., "Uhr".
     */
    /**
     * @type {Translations}
     */
    this.translations = {
      buttonTickets: '',
      linkDetails: '',
      soldOut: '',
      timeSuffix: ''
    }

    this.answerEventNameListener = (event) => {
      event.detail.fetch.then((data) => this.renderHTML(data))
    }

    this.eventsLoaded = false
    this.translationsLoaded = false

    this.selectListener = (event) => {
      event.preventDefault()
      console.log(event, event.detail)
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()

    if (this.eventsLoaded && this.translationsLoaded) {
      this.renderHTML()
    }

    document.body.addEventListener(
      this.getAttribute('answer-event-name') || 'answer-event-name',
      this.answerEventNameListener
    )

    this.addEventListener('click', this.selectListener)

    this.dispatchEvent(
      new CustomEvent(this.getAttribute('request-event-name'), {
        bubbles: true,
        cancelable: true,
        composed: true
      })
    )
  }

  disconnectedCallback () {
    document.body.removeEventListener(
      this.getAttribute('answer-event-name') || 'answer-event-name',
      this.answerEventNameListener
    )

    this.removeEventListener('click', this.selectListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(
      `:host > style[_css], ${this.tagName} > style[_css]`
    )
  }

  renderCSS () {
    this.css = /* css */ `
      :host {
        --button-secondary-width: 100%;
        --button-secondary-font-size: 1rem;
      }
      :host .event-list {
        border-bottom: 1px solid var(--steps-color-black);
        margin: 1.25rem 0;
      }
      :host .no-events {
        display: flex;
        justify-content: center;
        align-items: center;
        border-top: 1px solid var(--steps-color-black);
      }
    `
  }

  renderHTML (data) {
    this.fetchModules([
      {
        path: `${this.importMetaUrl}../../molecules/eventCard/EventCard.js`,
        name: 'm-steps-event-card'
      }
    ]).then(() => {
      const eventHtml = data.events
        .map((event) => {
          const {
            choreographer,
            company,
            companyDetailPageUrl,
            eventDate,
            eventInformationIcons,
            location,
            presaleUrl,
            production,
            soldOut,
            theater,
            theaterInformationIcons
          } = event
          const eventIcons = JSON.stringify(eventInformationIcons)
          const theaterIcons = JSON.stringify(theaterInformationIcons)
  
          return /* html */ `<m-steps-event-card 
            choreographer="${choreographer}"
            company="${company}"
            companyDetailPageUrl="${companyDetailPageUrl}"
            eventDate="${eventDate}"
            eventInformationIcons='${eventIcons}'
            location="${location}"
            presaleUrl="${presaleUrl}"
            production="${production}"
            soldOut="${soldOut}"
            theater="${theater}"
            theaterInformationIcons='${theaterIcons}'
            textButtonTickets="${data.translations.buttonTickets}"
            textLinkDetails="${data.translations.linkDetails}"
            textSoldOut="${data.translations.soldOut}"
            textTimeSuffix="${data.translations.timeSuffix}"
          ></m-steps-event-card>`
        })
        .join('')
  
      const noEventsHtml = eventHtml.length ? '' : /* html */ `
        <div class="no-events">
            <p>${data.translations.noEvents}</p>
        </div>`
  
      this.html = ''
      this.html = /* html */ `
        <div class="event-list">
          ${eventHtml}${noEventsHtml}
        </div>
      `
    })
  }
}
