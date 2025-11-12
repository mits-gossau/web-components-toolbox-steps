// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
 * EventCard
 * An example at: src/es/components/pages/Event.html
 *
 * @export
 * @class EventCard
 * @type {CustomElementConstructor}
 */

export default class EventCard extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    /**
     * Represents an event.
     * @typedef {object} Event
     * @property {string} choreographer - The choreographer of the event.
     * @property {string} company - The company associated with the event.
     * @property {string} companyDetailPageUrl - The URL of the company's detail page.
     * @property {string} eventDate - The date of the event.
     * @property {string} eventTime - The time of the event.
     * @property {string[]} eventInformationIcons - An array of URLs representing event information icons.
     * @property {string[]} eventInformationIconsList - An array of URLs representing event information icons in list format.
     * @property {string} forFree - Indicates if the event is for free.
     * @property {string} location - The location of the event.
     * @property {string} presaleUrl - The URL for purchasing tickets in advance.
     * @property {string} presaleUrlTitle - The title for the presale URL link.
     * @property {string} production - The production associated with the event.
     * @property {string} soldOut - Indicates if the event is sold out.
     * @property {string} theater - The theater where the event takes place.
     * @property {string[]} theaterInformationIcons - An array of URLs representing theater information icons.
     */
    /**
     * @type {Event}
     */
    this.event = {
      choreographer: '',
      company: '',
      companyDetailPageUrl: '',
      eventDate: '',
      eventTime: '',
      eventInformationIcons: [],
      eventInformationIconsList: [],
      forFree: '',
      location: '',
      presaleUrl: '',
      presaleUrlTitle: '',
      production: '',
      soldOut: '',
      theater: '',
      theaterInformationIcons: []
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) {
      this.renderCSS()
    }

    // properties
    this.event = {
      choreographer: this.getAttribute('choreographer'),
      company: this.getAttribute('company') || '',
      companyDetailPageUrl: this.getAttribute('companyDetailPageUrl'),
      eventDate: this.getAttribute('eventDate'),
      eventTime: this.getAttribute('eventTime'),
      eventInformationIcons: JSON.parse(this.getAttribute('eventInformationIcons')),
      eventInformationIconsList: JSON.parse(this.getAttribute('eventInformationIconsList')),
      forFree: this.getAttribute('forFree'),
      location: this.getAttribute('location'),
      presaleUrl: this.getAttribute('presaleUrl'),
      presaleUrlTitle: this.getAttribute('presaleUrlTitle') || 'Tickets',
      production: this.getAttribute('production'),
      soldOut: this.getAttribute('soldOut'),
      theater: this.getAttribute('theater'),
      theaterInformationIcons: JSON.parse(this.getAttribute('theaterInformationIcons'))
    }

    this.renderHTML()
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
      :host .event-grey-out {
        color: var(--steps-color-grey-sold-out);
      }
      :host .event-grey-out .event-cta a-button {
        pointer-events: none;
        background: var(--steps-color-white);;
        opacity: 0.3;
      }
      :host .event-grey-out .legend-icons {
        opacity: 0.3;
      }
      :host .event-card {
        border-top: 1px solid var(--steps-color-black);
        padding: 1.25rem 0;
        display: flex;
        flex-direction: row;
        gap: 1rem;
        position: relative;
      }
      :host .event-card p {
        margin: 0;
      }
      :host .event-date {
        white-space: nowrap;
        width: 120px;
      }
      :host .event-date p {
        font-size: var(--event-date-font-size);
      }
      :host .event-date span {
        display: block;
        font-size: 1.8rem;
      }
      :host .event-info {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
      }
      :host .event-info > * {
        flex-grow: 0;
        flex-shrink: 0;
        hyphens: none;
      }
      :host .event-info p {
        line-height: 18px;
      }

      :host .legend-icons {
        display: inline-block;
        margin-top: 0.5rem;
        margin-right: 1.25rem;
        white-space: nowrap;
      }
      :host .legend-icons img {
        margin-right: 0.375rem;
      }
      :host .event-cta {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        gap: 1.25rem;
        padding: 1.25rem 0;
        font-size: 1rem;
      }
      :host .event-cta a-button {
        white-space: nowrap;
      }
      :host .event-cta a {
        color: var(--steps-color-black);
        padding-top: var(--button-secondary-padding) ;
      }
      :host .event-grey-out .sold-out {
        color: var(--steps-color-black);
      }
      :host .sold-out {
        text-transform: capitalize;
      }
      
      @media only screen and (min-width: 768px)  {
        :host .event-card { 
          gap: 2rem;
        }
        :host .event-info {
          flex-direction: row;
          justify-content: space-between;
        }
        :host .event-info > *:first-child {
          flex-basis: 25%;
        }
        :host .event-info > *:not(:first-child) {
          flex-basis: 20%;
        }
        :host .event-info p {
          line-height: 20px;
        }
        :host .event-cta {
          flex-direction: column;
          padding: 0;
          gap: 0.5rem;
        }
      }
    `
  }

  renderHTML () {
    this.fetchModules([
      {
        path: `${this.importMetaUrl}../../web-components-toolbox/src/es/components/atoms/button/Button.js`,
        name: 'a-button'
      }
    ]).then(() => {
      // parse date and time to matching format
      const currentDate = new Date()
      const partDate = this.event.eventDate.split('.')
      const partTime = this.event.eventTime.split(':')
      const formattedDate = `${partDate[2]}-${('0' + partDate[1]).slice(-2)}-${('0' + partDate[0]).slice(-2)}T${('0' + partTime[0]).slice(-2)}:${('0' + partTime[1]).slice(-2)}`
      const parsedDate = new Date(formattedDate)

      // get weekday name by date
      const lang = document.documentElement.getAttribute('lang')

      const weekday = parsedDate.toLocaleDateString(lang === 'de' ? 'de-DE' : lang || 'de-DE', {
        weekday: 'long'
      })

      // icons
      const generateIconHTML = (iconsArray) => {
        let icons = ''
        for (const icon of iconsArray) {
          if (icon.hideInFilter) {
            if (icon.hideInFilter === 'False') {
              icons += `<img src="${icon.src}" width="24" height="24" alt="${icon.alt}" />`
            }
          } else {
            icons += `<img src="${icon.src}" width="24" height="24" alt="${icon.alt}" />`
          }
        }

        return icons
      }

      const eventIconList = this.event.eventInformationIconsList.map(icon => `<img src="${icon.src}" width="24" height="24" alt="${icon.alt}" />`).join(',')
      const theaterIcons = generateIconHTML(this.event.theaterInformationIcons)

      // urls
      const ticketsUrl = this.event.presaleUrl
      const detailsUrl = this.event.companyDetailPageUrl
      // buttons
      const buttonTickets = `<a-button namespace="button-steps-spielplan-" onclick="window.open('${ticketsUrl}')">${this.event.presaleUrlTitle} &#8594;</a-button>`
      const buttonSoldOut = `<span class="sold-out">${this.getAttribute('textSoldOut')}</span>`
      const buttonCta = this.event.soldOut === 'True' ? buttonSoldOut : buttonTickets
      const buttonForFree = `<span class="sold-out">${this.getAttribute('textForFree') || 'Gratis'}</span>`
      const buttonCtaForFree = this.event.forFree === 'True' ? buttonForFree : ''
      const eventIconListHTML = eventIconList ? `<span class="legend-icons">${eventIconList}</span>` : ''
      const theaterIconsHTML = theaterIcons ? `<span class="legend-icons">${theaterIcons}</span>` : ''

      const eventInfoHtml = /* html */ `
        <div class="event-info">
          ${this.event.company === 'undefined'
          ? ''
          : `
            <p>
              <strong>${this.event.company}</strong><br />
              <span>${this.event.production}<br />${this.event.choreographer}</span>
            </p>
            `
        }
          <p>
            <strong>${this.event.location}</strong><br />
            <span>${this.event.theater}</span>
          </p>
          <p>
            ${this.event.eventTime}<br />
            ${eventIconListHTML}
            ${theaterIconsHTML}
          </p>
          <p class="event-cta">
            ${buttonCtaForFree !== '' ? buttonCtaForFree : buttonCta}
            ${this.event.companyDetailPageUrl === 'undefined'
          ? ''
          : `<a href="${detailsUrl}">${this.getAttribute('textLinkDetails')}</a>`
        }
          </p>
        </div>
      `

      this.html = /* html */ `
        <div class="${this.event.soldOut === 'True' || parsedDate < currentDate ? 'event-card event-grey-out' : 'event-card'}">
          <div class="event-date">
            <p>${weekday}<br /><span>${this.event.eventDate.slice(0, -4)}</span></p>
          </div>
          ${eventInfoHtml}
        </div>
      `
    })
  }
}
