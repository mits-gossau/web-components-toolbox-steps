// @ts-check
/* global fetch */
/* global AbortController */
/* global location */
/* global sessionStorage */
/* global CustomEvent */
/* global history */
/* global self */

/** @typedef {{
  choreographer:string
  company: string,
  companyDetailPageUrl: string | null,
  eventDate: string
  eventInformationIcons: string | null,
  eventName: string,
  location: string,
  presaleUrl: string | null,
  production: string,
  soldOut: string,
  theater: string,
  theaterInformationIcons: string[]
}} Event */

/** @typedef {{
  events: Event[],
  translations: Translations
}} ListEvents */

/** @typedef {{
  buttonTickets: string,
  linkDetails: string,
  soldOut: string,
  timeSuffix: string,
}} Translations */

/** @typedef {
  {
    items: Event[] | string[],
    filterType: 'company' | 'location'
  } | null
} ListFilterItems */

/** @typedef {{
  companies: string[],
  events: Event[],
  locations: string[],
  max: string,
  min: string,
  translations: Translations
}} All */

import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
 * Events are retrieved via the corresponding endpoint as set as an attribute
 * As a controller, this component communicates exclusively through events
 * Example: https://www.alnatura.ch/rezepte
 *
 * @export
 * @class Events
 * @type {CustomElementConstructor}
 */
export default class Events extends Shadow() {
  constructor (options = {}, ...args) {
    super({
      importMetaUrl: import.meta.url,
      mode: 'false',
      ...options
    }, ...args)

    this.resetButton = this.root.querySelector('.filter-button-hidden');

    this.requestListEventsListener = event => {
      this.dispatchEvent(new CustomEvent('list-events', {
        detail: {
          fetch: this.fetch.then(result => ({
            events: event.detail
              ? result.events.filter(resultEvent => {
                const filterType = event.detail?.this.getAttribute('filter-type')
                // show reset button
                this.resetButton.classList.remove('filter-button-hidden');
                // TODO: match Flatpickr tags: ["2023-10-10"] with eventDate:("24.4.2024 19:30:0")
                //if (filterType === 'eventDate' && typeof event.detail.tags[0] ===  'string') event.detail.tags[0] = new Date(...(event.detail.tags[0].replace(/\s.*/, '').split('.').reverse().map((date, i) => i === 1 ? Number(date)-1 : date)))
                return resultEvent?.[filterType] === event.detail.tags[0]
              })
              : result.events,
            translations: result.translations
          }))
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    this.requestListFilterItemsEventsListener = event => {
      this.dispatchEvent(new CustomEvent('list-filter-items', {
        detail: {
          fetch: this.fetch.then(
            /**
             * @param {All} result
             * @return {ListFilterItems}
             */
            result => event.detail.isActive
              ? event.detail.tags.includes('companies')
                ? {
                  items: result.companies,
                  filterType: 'company'
                }
                : {
                  items: result.locations,
                  filterType: 'location'
                }
              : null
            )
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    /**
     * Reset filtered list
     * @param {*} event
     */
    this.requestListResetEventsListener = event => {
      this.dispatchEvent(new CustomEvent('list-events', {
        detail: {
          fetch: this.fetch.then(result => ({
            events: result.events,
            translations: result.translations
          }))
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))

      // hide reset button
      this.resetButton.classList.add('filter-button-hidden');
    }
  }

  connectedCallback () {
    this.addEventListener('request-list-events', this.requestListEventsListener)
    this.addEventListener('request-list-filter-items', this.requestListFilterItemsEventsListener)
    this.addEventListener('request-list-reset', this.requestListResetEventsListener)
  }

  disconnectedCallback () {
    this.removeEventListener('request-list-events', this.requestListEventsListener)
    this.removeEventListener('request-list-filter-items', this.requestListFilterItemsEventsListener)
    this.removeEventListener('request-list-reset', this.requestListResetEventsListener)
  }

  /**
   * @return All
   */
  get fetch () {
    return this._fetch || (this._fetch = fetch(this.getAttribute('endpoint'), {
      method: 'GET'
    }).then(async response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }

      let { events, translations } = await response.json()

      const companies = events.map(event => event.company).sort()
      const locations = events.map(event => event.location).sort()

      return {
        events,
        translations,
        companies,
        locations
      }
    }))
  }
}
