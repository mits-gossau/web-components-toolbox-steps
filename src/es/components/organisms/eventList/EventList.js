// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'
// fetch modules / Shadow:Line 604
import(
  '../../molecules/eventCard/EventCard.js'
  // @ts-ignore
).then((module) => customElements.define('m-steps-event-card', module.default))
import(
  '../../web-components-toolbox/src/es/components/atoms/dateSelect/DateSelect.js'
  // @ts-ignore
).then((module) => customElements.define('a-date-select', module.default))

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
      // this.renderHTML('loading')
      /* event.detail.fetch.then(recipeData => {
        this.renderHTML(recipeData.items)
      }) */
      console.log('helloooo', event, event.detail)
    }

    this.eventsLoaded = false
    this.translationsLoaded = false
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()

    const dataEventsUrl = this.getAttribute('data-events')
    const dataTranslationsUrl = this.getAttribute('data-translations')

    const savedEventsData = localStorage.getItem('eventsData')
    const savedTranslationsData = localStorage.getItem('translationsData')

    const handleEventsResponse = (data) => {
      // localStorage.setItem('eventsData', JSON.stringify(data.events))
      this.events = data.events
      this.eventsLoaded = true
      this.checkRenderHTML()
    }

    const handleTranslationsRepsonse = (data) => {
      // localStorage.setItem('translationsData', JSON.stringify(data.translations))
      this.translations = data.translations
      this.translationsLoaded = true
      this.checkRenderHTML()
    }

    const handleError = (error) => {
      console.error(error)
    }

    // FYI: Andy preferred to always get the fetched data for debugging reasons, can be activated again later, although it should have a time limit or be sessionStorage
    /*if (savedEventsData) {
      this.events = JSON.parse(savedEventsData)
      this.eventsLoaded = true
    } else {*/
      fetch(dataEventsUrl)
        .then((response) => response.json())
        .then(handleEventsResponse)
        .catch(handleError)
    //}

    // FYI: Andy preferred to always get the fetched data for debugging reasons, can be activated again later, although it should have a time limit or be sessionStorage
    /*if (savedTranslationsData) {
      this.translations = JSON.parse(savedTranslationsData)
      this.translationsLoaded = true
    } else {*/
      fetch(dataTranslationsUrl)
        .then((response) => response.json())
        .then(handleTranslationsRepsonse)
        .catch(handleError)
    //}

    if (this.eventsLoaded && this.translationsLoaded) {
      this.renderHTML()
    }

    document.body.addEventListener(
      this.getAttribute('answer-event-name') || 'answer-event-name',
      this.answerEventNameListener
    )
  }

  checkRenderHTML () {
    if (this.eventsLoaded && this.translationsLoaded) {
      this.renderHTML()
    }
  }

  disconnectedCallback () {
    document.body.removeEventListener(
      this.getAttribute('answer-event-name') || 'answer-event-name',
      this.answerEventNameListener
    )
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
      :host .filter-buttons {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 40px;
      }
      @media only screen and (min-width: 768px) {
        :host .filter-buttons {
          flex-direction: row;
        }
      }
      :host a-date-select,
      :host a-button:not(:last-child) {
        margin-right: 1.25rem;
        margin-bottom: 1.25rem;
      }
      @media only screen and (min-width: 768px) {
        :host a-date-select, 
        :host a-button:not(:last-child) {
          margin-bottom: 0;
        }
      }
      :host a-button.active {
        --button-secondary-font-family: var(--font-family-bold);
      }
      :host .filter-items {
        margin: 0.625rem 0;
      }
      :host .filter-items ul {
        padding-left: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
      :host .filter-items a {
        text-decoration: none;
        font-family: var(--font-family);
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        margin: 0 1.25rem 0 0;
        padding: 0.625rem 0;
      }
      :host .filter-items a::before {
        display: block;
        content: attr(data-text);
        font-family: var(--font-family-bold);
        font-weight: normal;
        height: 0;
        overflow: hidden;
        visibility: hidden;
        margin: 0 1px;
      }
      :host .filter-items a:hover {
        color: var(--steps-color-black);
        font-family: var(--font-family-bold);
        font-weight: normal;
      }
    `
  }

  renderHTML () {
    const eventHtml = this.events
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
          textButtonTickets="${this.translations.buttonTickets}"
          textLinkDetails="${this.translations.linkDetails}"
          textSoldOut="${this.translations.soldOut}"
          textTimeSuffix="${this.translations.timeSuffix}"
        ></m-steps-event-card>`
      })
      .join('')
    
    // date kung fu
    const eventDates = this.events.map(event => event.eventDate)
    const dateObjects = eventDates.map(dateString => {
      const dateParts = dateString.split('.')
      const timeParts = dateParts[2].split(' ')
      const day = parseInt(dateParts[0])
      const month = parseInt(dateParts[1]) - 1
      const year = parseInt(timeParts[0])
      const eventTime = timeParts[1]
      const [hours, minutes, seconds] = eventTime.split(':').map(Number)
      
      return new Date(year, month, day, hours, minutes, seconds)
    })
    const dateTimestamps = dateObjects.map(date => date.getTime())
    const minTimestamp = Math.min(...dateTimestamps)
    const maxTimestamp = Math.max(...dateTimestamps)
    const minDate = new Date(minTimestamp)
    const maxDate = new Date(maxTimestamp)
    const formattedMinYear = minDate.toLocaleString('de-CH', { year: "numeric" })
    const formattedMinMonth = minDate.toLocaleString('de-CH', { month: "2-digit" })
    const formattedMinDay = minDate.toLocaleString('de-CH', { day: "2-digit" })
    const formattedMinDate = formattedMinYear + '-' + formattedMinMonth + '-' + formattedMinDay
    const formattedMaxYear = maxDate.toLocaleString('de-CH', { year: "numeric" })
    const formattedMaxMonth = maxDate.toLocaleString('de-CH', { month: "2-digit" })
    const formattedMaxDay = maxDate.toLocaleString('de-CH', {  day: "2-digit" })
    const formattedMaxDate = formattedMaxYear + '-' + formattedMaxMonth + '-' + formattedMaxDay

    this.html = /* html */ `
      <div class="event-list">
        <div class="filter-buttons">
            <a-date-select 
                namespace="date-select-secondary-"
                placeholder="Datum auswählen"
                calendarIndicator=" → 📅"
                min="${formattedMinDate}"
                max="${formattedMaxDate}"
                closeTooltip="Zurücksetzen"
                locale="de-CH"
            ></a-date-select>
        </div>

        ${eventHtml}
      </div>
    `
  }
}
