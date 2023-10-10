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

/** @typedef {'company' | 'location' | 'date'} FilterType */

/** @typedef {
  {
    items: Event[] | string[],
    filterType: 'company' | 'location',
    filterTypePlural: 'companies' | 'locations'
  }
} ListFilterItems */

/** @typedef {{
  companies: string[],
  events: Event[],
  locations: string[],
  translations: Translations,
  dates: string[],
  maxDate: Date,
  minDate: Date
}} FetchAll */

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

    this.requestListEventsListener = event => {
      this.dispatchEvent(new CustomEvent('list-events', {
        detail: {
          fetch: this.fetch.then(result => {
            let events
            if (event.detail && event.detail.this && event.detail.this.getAttribute('filter-type') && event.detail.tags && event.detail.tags[0]) {
              this.setParameter(event.detail.this.getAttribute('filter-type'), event.detail.tags[0], event.detail.pushHistory, event.detail.isActive)
              events = this.filterEvents(result.events, this.getParameter('company'), this.getParameter('location'), this.getParameter('date'), event.detail?.dateStrSeparator)
            } else {
              this.setParameter('company', null)
              this.setParameter('location', null)
              this.setParameter('date', null)
              events = result.events
            }
            return {
              events,
              translations: result.translations,
              filter: {
                company: this.getParameter('company'),
                location: this.getParameter('location'),
                date: this.getParameter('date'),
                dateReset: !this.getParameter('date'),
                active: String(!!(this.getParameter('company') || this.getParameter('location') || this.getParameter('date')))
              }
            }
          })
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
             * @param {FetchAll} result
             * @return {ListFilterItems | {}}
             */
            result => event.detail.isActive
              ? event.detail.tags.includes('companies')
                ? {
                  items: result.companies,
                  filterType: 'company',
                  filterTypePlural: 'companies'
                }
                : {
                  items: result.locations,
                  filterType: 'location',
                  filterTypePlural: 'locations'
                }
              : {}
            )
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    this.getDateOptionEventsListener = event => {
      event.detail.resolve(this.fetch.then(result => {
        // see all possible options: https://flatpickr.js.org/options/
        return {
          maxDate: result.maxDate,
          minDate: result.minDate
        }
      }))
    }
  }

  connectedCallback () {
    this.addEventListener('request-list-events', this.requestListEventsListener)
    this.addEventListener('request-list-filter-items', this.requestListFilterItemsEventsListener)
    this.addEventListener('get-date-option', this.getDateOptionEventsListener)
  }

  disconnectedCallback () {
    this.removeEventListener('request-list-events', this.requestListEventsListener)
    this.removeEventListener('request-list-filter-items', this.requestListFilterItemsEventsListener)
    this.removeEventListener('get-date-option', this.getDateOptionEventsListener)
  }

  /**
   * FilterList generated buttons hold two relevant attributes: filter-type (company | location) & tag (string)
   * those attributes are received inside the request-list-events event details
   *
   * @param {Event[]} events
   * @param {string | null} company
   * @param {string | null} location
   * @param {string | null} dates
   * @param {string | null} [dateStrSeparator]
   * @return {Event[]}
   */
  filterEvents (events, company, location, dates, dateStrSeparator = ' — ') {
    const dateArray = []
    if (dates && dateStrSeparator) {
      const [minDate, maxDate] = dates.split(dateStrSeparator).map(date => this.deChDateToDateObj(date))
      console.log('changed', {dateStrSeparator, dateArray, dates, minDate, maxDate});
      for(const currentDate = new Date(minDate); currentDate <= new Date(maxDate || minDate); currentDate.setDate(currentDate.getDate() + 1)){
        dateArray.push(new Date(currentDate))
      }
    }
    return events.filter(resultEvent => {
      return (!company || resultEvent?.company === company) && (!location || resultEvent?.location === location) && (!dates || !dateArray || !dateArray.length || dateArray.map(date => this.dateObjToDeChDate(date)).includes(resultEvent?.eventDate))
    })
  }

  /**
   * Set filterType in window.history
   * @param {FilterType} filterType
   * @param {string | null} tag
   * @param {boolean} [pushHistory = true]
   * @param {boolean} [isActive = true]
   * @return {URL}
   */
  setParameter (filterType, tag, pushHistory = true, isActive = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    if (tag && isActive) {
      url.searchParams.set(filterType, tag)
    } else {
      url.searchParams.delete(filterType)
    }
    // TODO: handle popState Events
    if (pushHistory) history.pushState({ ...history.state, tag }, document.title, url.href) // TODO: make sure the title reflects the setParameters
    return url
  }

  /**
   * Get filterType from url
   * @param {FilterType} filterType
   * @return string | null
   */
  getParameter (filterType) {
    const urlParams = new URLSearchParams(location.search)
    const tag = urlParams.get(filterType)
    if (tag) return tag
    return null
  }

  /**
   * @return {Promise<FetchAll>}
   */
  get fetch () {
    return this._fetch || (this._fetch = fetch(this.getAttribute('endpoint'), {
      method: 'GET'
    }).then(async response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }

      /** @type {{events:Event[], translations:Translations}} */
      let { events, translations } = await response.json()

      /** @type {string[]} */
      const companies = events.map(event => event.company).sort()
      /** @type {string[]} */
      const locations = events.map(event => event.location).sort()
      /** @type {string[]} */
      const dates = events.map(event => event.eventDate)

      return {
        events,
        translations,
        companies,
        locations,
        dates,
        maxDate: this.deChDateToDateObj(dates.slice(-1)[0]),
        minDate: this.deChDateToDateObj(dates[0])
      }
    }))
  }

  deChDateToDateObj (dateStr) {
    // @ts-ignore
    return new Date(...dateStr.split('.').reverse().map((date, i) => i === 1 ? Number(date)-1 : date))
  }

  dateObjToDeChDate (dateObj) {
    return dateObj.toLocaleString('de-CH', {year: 'numeric', month: '2-digit', day: '2-digit'})
  }
}
