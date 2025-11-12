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
  dateObj?: Date,
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

/** @typedef {'company' | 'location' | 'date' | 'accessibility'} FilterType */

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
 * Events (Veranstaltungen)
 * As a controller, this component communicates exclusively through events
 * Example: https://mits-gossau.github.io/web-components-toolbox-steps/src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&header=./src/es/components/organisms/header/nav-right-/nav-right-.html&logo=./src/es/components/atoms/logo/default-/default-.html&nav=./src/es/components/molecules/navigation/default-/default-.html&footer=./src/es/components/organisms/footer/default-/default-.html&content=./src/es/components/pages/Spielplan.html
 *
 * The endpoint api call at the fetch getter, gets all events plus some translations
 * These events get enriched with the properties companies, locations, dates, maxDate, minDate, which are used by the filters (buttons and flatpickr)
 * buttons have two possible filter-type company or location
 *
 * requestListEventsListener:
 * Datepicker (Flatpickr) and buttons trigger the requestListEventListener on interaction, this returns the filtered event list in the event 'list-events'
 * The dispatched event 'list-events' is listened by the buttons, which react accordingly with their active state
 * The event list also reacts on 'list-events' and renders the filtered newly received events
 * The filters are saved as parameters in the URL and get reused except the clear all button is pushed, which has the ID 'filter-clean'
 *
 * requestHrefEventListener:
 * Triggers this.setParameter to receive the resulting URL in case that filter-type with that fix value (tag), this is purely informal and triggers no URL/state change
 * As a result, the Button.js can have an href on it's a-tag, for better SEO as well as "right click - open in new tab" feature
 *
 * requestListFilterItemsEventsListener:
 * There is a filter factory called FilterList, which requests the possible filters, this is supplied by the enriched fetch, also any url/state is supplied to set the active filters .active
 *
 * getDateOptionEventsListener:
 * Is used by the DatePicker (Flatpickr), to select the in url/state set range, min/maxDate
 *
 * updatePopState:
 * dispatches two events: 'list-events' and 'set-date' to mirror the browser history navigation
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

    this.separator = '➕'
    /**
     * calculated dates between min/max actual date expl.: 11.10.2023+—+26.10.2023 would be 11.10.2023 + 12.10.2023 + 13.10.20203 + ... + 26.10.2023
     * @type {Map<string, Date[]>}
     */
    this.dateArrayMap = new Map()
    // gets fed by get-date-option from the flatpickr, this here is just a default value
    this.dateStrSeparator = ' — '

    // dispatches 'list-events'
    this.requestListEventsListener = event => {
      this.dispatchEvent(new CustomEvent('list-events', {
        detail: {
          fetch: this.fetch.then(result => {
            let events
            if (event && event.detail && event.detail.this && event.detail.this.getAttribute('filter-type') && event.detail.tags && event.detail.tags[0]) {
              this.setParameter(event.detail.this.getAttribute('filter-type'), event.detail.tags[0], event.detail.pushHistory, event.detail.isActive)
              events = this.filterEvents(result.events, this.getParameter('company'), this.getParameter('location'), this.getParameter('date'), this.getParameter('accessibility'), event.detail?.dateStrSeparator)
            } else if (event && event.detail && event.detail.this && event.detail.this.getAttribute('id') === 'filter-clean') {
              this.setParameter('company', null)
              this.setParameter('location', null)
              this.setParameter('accessibility', null)
              this.setParameter('date', null)
              events = result.events
            } else {
              events = this.filterEvents(result.events, this.getParameter('company'), this.getParameter('location'), this.getParameter('date'), this.getParameter('accessibility'), event?.detail?.dateStrSeparator)
            }
            return {
              events,
              translations: result.translations,
              filter: {
                company: this.getParameter('company')?.split(this.separator),
                location: this.getParameter('location')?.split(this.separator),
                accessibility: this.getParameter('accessibility')?.split(this.separator),
                date: this.getParameter('date'),
                dateReset: !this.getParameter('date'),
                active: String(!!(this.getParameter('company') || this.getParameter('location') || this.getParameter('date') || this.getParameter('accessibility')))
              }
            }
          })
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    // resolves / inform about the url which would result on this filter
    this.requestHrefEventListener = event => {
      if (event.detail && event.detail.resolve) event.detail.resolve(this.setParameter(event.detail.this.getAttribute('filter-type'), event.detail.tags[0], event.detail.pushHistory).href)
    }

    // dispatches 'list-filter-items'
    this.requestListFilterItemsEventsListener = event => {
      this.dispatchEvent(new CustomEvent('list-filter-items', {
        detail: {
          fetch: this.fetch.then(
            /**
             * @param {FetchAll} result
             * @return {ListFilterItems | {}}
             */
            result => {
              if (event.detail.isActive) {
                if (event.detail.tags.includes('companies')) {
                  return {
                    items: result.companies,
                    filterType: 'company',
                    filterTypePlural: 'companies',
                    filterActive: this.getParameter('company')
                  }
                }
                if (event.detail.tags.includes('locations')) {
                  return {
                    items: result.locations,
                    filterType: 'location',
                    filterTypePlural: 'locations',
                    filterActive: this.getParameter('location')
                  }
                }
                if (event.detail.tags.includes('accessibility')) {
                  return {
                    items: this.getAllUniqueTheaterIcons(result.events).filter(e => !e.hideInFilter).map(icon => icon.alt),
                    filterType: 'accessibility',
                    filterTypePlural: 'accessibility',
                    filterActive: this.getParameter('accessibility')
                  }
                }
                return {}
              } else {
                return {}
              }
            }
          )
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    // resolves flatpickr settings
    this.getDateOptionEventsListener = event => {
      event.detail.resolve(this.fetch.then(result => {
        if (event.detail.dateStrSeparator) this.dateStrSeparator = event.detail.dateStrSeparator
        // see all possible options: https://flatpickr.js.org/options/
        let defaultDate = null
        let dateStr
        if ((dateStr = this.getParameter('date'))) defaultDate = dateStr.split(this.dateStrSeparator).map(date => this.deChDateToDateObj(date))
        return {
          maxDate: result.maxDate,
          minDate: result.minDate,
          defaultDate,
          dateStr
        }
      }))
    }

    // dispatches 'list-events' + 'set-date'
    this.updatePopState = event => {
      for (const key in event.state) {
        this.setParameter(key, event.state[key], false, true)
      }
      this.requestListEventsListener()
      new Promise(resolve => this.getDateOptionEventsListener({ detail: { resolve } })).then(data => {
        // inform the Flatpickr through this event, since it does not listen to "list-events"
        this.dispatchEvent(new CustomEvent('set-date', {
          detail: data,
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      })
    }
  }

  connectedCallback () {
    this.addEventListener('request-list-events', this.requestListEventsListener)
    this.addEventListener('request-href-' + (this.getAttribute('request-list-events') || 'request-list-events'), this.requestHrefEventListener)
    this.addEventListener('request-list-filter-items', this.requestListFilterItemsEventsListener)
    this.addEventListener('get-date-option', this.getDateOptionEventsListener)
    if (!this.hasAttribute('no-popstate')) self.addEventListener('popstate', this.updatePopState)
  }

  disconnectedCallback () {
    this.removeEventListener('request-list-events', this.requestListEventsListener)
    this.removeEventListener('request-href-' + (this.getAttribute('request-list-events') || 'request-list-events'), this.requestHrefEventListener)
    this.removeEventListener('request-list-filter-items', this.requestListFilterItemsEventsListener)
    this.removeEventListener('get-date-option', this.getDateOptionEventsListener)
    if (!this.hasAttribute('no-popstate')) self.removeEventListener('popstate', this.updatePopState)
  }

  /**
   * You name it whatever you like, but let's call it `getAllUniqueTheaterIcons`
   * @param {Event[]} events
   * @return {{alt: string, src: string, hideInFilter: boolean}[]}
   */
  getAllUniqueTheaterIcons (events) {
    const map = new Map()

    for (const ev of events) {
      // const icons = ev?.eventInformationIcons
      const icons = (ev?.eventInformationIcons || []).concat(ev?.theaterInformationIconsFilter || [])

      if (!Array.isArray(icons)) continue

      for (const icon of icons) {
        if (!icon || typeof icon !== 'object') continue

        const alt = String(icon.alt ?? '').trim()
        const src = String(icon.src ?? '').trim()
        const hideInFilter = icon.hideInFilter.toLowerCase() === 'true'

        if ((!alt && !src) && !hideInFilter) continue

        const key = `${alt}||${src}`

        if (!map.has(key)) {
          map.set(key, { alt, src, hideInFilter })
        }
      }
    }

    return Array.from(map.values())
  }

  /**
   * FilterList generated buttons hold two relevant attributes: filter-type (company | location) & tag (string)
   * those attributes are received inside the request-list-events event details
   * also the Flatpickr uses request-list-events
   *
   * @param {Event[]} events
   * @param {string | null} company
   * @param {string | null} location
   * @param {string | null} dates
   * @param {string | null} accessibility
   * @param {string | null} [dateStrSeparator = this.dateStrSeparator]
   * @return {Event[]}
   */
  filterEvents (events, company, location, dates, accessibility, dateStrSeparator = this.dateStrSeparator) {
    const dateArray = this.dateArrayMap.get(dates || '') || []
    // generate all date objects between and including a start and end date
    if (dates && dateStrSeparator && !dateArray.length) {
      const [minDate, maxDate] = dates.split(dateStrSeparator).map(date => this.deChDateToDateObj(date))
      for (const currentDate = new Date(minDate); currentDate <= new Date(maxDate || minDate); currentDate.setDate(currentDate.getDate() + 1)) {
        dateArray.push(new Date(currentDate))
      }
      this.dateArrayMap.set(dates, dateArray)
    }
    // filter accordingly... expl. if company set check for company, otherwise ignore and return true
    return events.filter(resultEvent => {
      const splittedAccessibilityTags = accessibility ? accessibility.split(this.separator) : []
      const accessibilityIcons = (resultEvent.eventInformationIcons || []).concat(resultEvent.theaterInformationIcons || [])
      const filteredResultEvent = accessibilityIcons.some(icon => splittedAccessibilityTags.includes(icon.alt))
      return (!accessibility || filteredResultEvent) && (!company || company.includes(resultEvent?.company)) && (!location || location.includes(resultEvent?.location)) && (!dateArray.length || dateArray.some(date => date.getTime() === resultEvent?.dateObj?.getTime()))
    })
  }

  /**
   * Set filterType in window.history
   * @param {FilterType | string} filterType
   * @param {string | null} tag
   * @param {boolean} [pushHistory = true]
   * @param {boolean} [isActive = true]
   * @return {URL}
   */
  setParameter (filterType, tag, pushHistory = true, isActive = true) {
    // create/update an url object with key (filterType) and value (tag) if isActive otherwise remove that key form the url params
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)

    if (filterType === 'date') {
      if (tag && isActive) {
        url.searchParams.set(filterType, tag)
      } else {
        url.searchParams.delete(filterType)
      }
    } else {
      // company and location support multiple selection
      // @ts-ignore
      const oldParameter = this.getParameter(filterType)
      if (tag && isActive) {
        if (!oldParameter?.includes(tag)) {
          url.searchParams.set(filterType, oldParameter ? `${oldParameter}${this.separator}${tag}` : tag)
        }
      } else {
        const oldParameterArray = oldParameter?.split(this.separator) || []
        if (oldParameterArray.length > 1 && tag !== null) {
          oldParameterArray.splice(oldParameterArray.indexOf(tag), 1)
          url.searchParams.set(filterType, oldParameterArray.join(this.separator))
        } else {
          url.searchParams.delete(filterType)
        }
      }
    }
    // update the url parameters in the actual url bar and history
    if (pushHistory) history.pushState({ ...history.state, [filterType]: tag }, document.title, url.href) // TODO: make sure the title reflects the setParameters
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
   * This fetch contains all needed data and is the only communication with the api endpoint
   *
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

      /** @type {Event[]} */
      events = events.map(event => {
        event.dateObj = this.deChDateToDateObj(event.eventDate)
        return event
      })
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

  // make 10.09.2024 to a date object by turning 2024 to year, 09 to month and 10 to day
  deChDateToDateObj (dateStr) {
    // @ts-ignore
    return new Date(...dateStr.split('.').reverse().map((date, i) => i === 1 ? Number(date) - 1 : date))
  }
}
