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
      event.detail.fetch.then(
        /** @param {import('../../controllers/events/Events.js').ListEvents} data */
        data => {
          this.renderHTML(data.events, data.translations)
        }
      )
    }

    this.eventsLoaded = false
    this.translationsLoaded = false
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()

    if (this.eventsLoaded && this.translationsLoaded) {
      this.renderHTML()
    }

    this.expiredTitle = this.getAttribute('expired-title') || 'Abgelaufene Events'

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

  renderHTML (data, translations) {
    this.fetchModules([
      {
        path: `${this.importMetaUrl}../../molecules/eventCard/EventCard.js`,
        name: 'm-steps-event-card'
      }
    ]).then(() => {
      /* Split active and expired events */
      const currentDate = new Date()
      let activeEvents = []
      let expiredEvents = []
  
      data.forEach((event) => {
        const parsedDate = this.parseDate(event.eventDate, event.eventTime);
  
        if (parsedDate > currentDate) {
          activeEvents.push(event)
        } else {
          expiredEvents.push(event)
        }
      })
  
      const activeEventHtml = this.collectMarkup(activeEvents, translations)
  
      this.headingHtml = /* html */ `
        <h2 class="heading heading--h2 heading--expired">${this.expiredTitle}</h2>
      `
  
      const expiredEventHtml = this.collectMarkup(expiredEvents, translations)
      
      /* Concat active events, heading and expired events */
      let concatMarkup = ''
      let eventHtml = concatMarkup.concat(activeEventHtml, this.headingHtml, expiredEventHtml)  
  
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

  /**
   * Create markup for active and expired events
   * @param {*} list 
   * @param {*} translations 
   * @returns events list
   */
  collectMarkup(list, translations) {
    return list.map((event) => {
      const {
        choreographer,
        company,
        companyDetailPageUrl,
        eventDate,
        eventTime,
        eventInformationIcons,
        location,
        presaleUrl,
        production,
        soldOut,
        theater,
        theaterInformationIcons
      } = event
      const eventIcons = JSON.stringify(eventInformationIcons || [])
      const theaterIcons = JSON.stringify(theaterInformationIcons || [])

      return `<m-steps-event-card 
        choreographer="${choreographer}"
        company="${company}"
        companyDetailPageUrl="${companyDetailPageUrl}"
        eventDate="${eventDate}"
        eventTime="${eventTime}"
        eventInformationIcons='${eventIcons}'
        location="${location}"
        presaleUrl="${presaleUrl}"
        production="${production}"
        soldOut="${soldOut}"
        theater="${theater}"
        theaterInformationIcons='${theaterIcons}'
        textButtonTickets="${translations.buttonTickets}"
        textLinkDetails="${translations.linkDetails}"
        textSoldOut="${translations.soldOut}"
        textTimeSuffix="${translations.timeSuffix}"
      ></m-steps-event-card>`
    })
    .join('')
  }

  /**
   * Parse date format to be able to compare
   * @param {*} date 
   * @returns parsed date
   */
  parseDate(date, time) {
    const partDate = date.split('.')
    const partTime = time.split(':')
    const formattedDate = `${partDate[2]}-${('0' + partDate[1]).slice(-2)}-${('0' + partDate[0]).slice(-2)}T${('0' + partTime[0]).slice(-2)}:${('0' + partTime[1]).slice(-2)}`
    const parsedDate = new Date(formattedDate)

    return parsedDate;
  }
}
