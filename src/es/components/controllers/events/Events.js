// @ts-check
/* global fetch */
/* global AbortController */
/* global location */
/* global sessionStorage */
/* global CustomEvent */
/* global history */
/* global self */

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

    this.abortController = null
    this.requestListEventsListener = async event => {
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()
      // TODO: event.detail.pushHistory if yes this.setTag()

      const fetchOptions = {
        method: 'GET',
        signal: this.abortController.signal
      }
      const endpoint = this.getAttribute('endpoint')

      const fetchEvents = async () => {
        try {
          const response = await fetch(endpoint, fetchOptions)

          if (!response.ok) {
            throw new Error(response.statusText)
          }

          let { events, translations } = await response.json()

          // Sort events by date
          function convertAndSortDates(events) {
            for (const event of events) {
              const parts = event.eventDate.split(" ");
              const partDate = parts[0].split(".");
              const partTime = parts[1].split(":");
              const formattedDate = `${partDate[2]}-${('0' + partDate[1]).slice(-2)}-${('0' + partDate[0]).slice(-2)}T${('0' +partTime[0]).slice(-2)}:${('0' + partTime[1]).slice(-2)}`;
              event.formattedDate = formattedDate;
              event.parsedDate = new Date(formattedDate);
            }

            events.sort((a, b) => a.parsedDate - b.parsedDate);
          
            for (const event of events) {
              delete event.formattedDate;
              delete event.parsedDate;
            }
          
            return events;
          }

          events = convertAndSortDates(events);

          // Get the min and max date of events
          const eventDates = events.map(event => event.eventDate)
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

          const formatDate = (date) => {
            const formattedYear = date.toLocaleString('de-CH', { year: 'numeric' })
            const formattedMonth = date.toLocaleString('de-CH', { month: '2-digit' })
            const formattedDay = date.toLocaleString('de-CH', { day: '2-digit' })
            return formattedYear + '-' + formattedMonth + '-' + formattedDay
          }

          const formattedMinDate = formatDate(minDate)
          const formattedMaxDate = formatDate(maxDate)

          const companies = events.map(event => event.company).sort()
          const locations = events.map(event => event.location).sort()

          // Filter events by selected date
          if (event.detail?.date) {
            events = events.filter(eventArray => eventArray.eventDate.includes(event.detail.date))
          }

          return {
            events,
            translations,
            min: formattedMinDate,
            max: formattedMaxDate,
            companies,
            locations
            // days: [1,2,3,4,8,9], months, years
          }
        } catch (error) {
          console.error(error)
          return []
        }
      }

      const dispatchListEvent = (eventName, detailObject) => {
        this.dispatchEvent(new CustomEvent(this.getAttribute(eventName) || eventName, {
          detail: detailObject,
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      }

      const fetchedEvents = fetchEvents()
      dispatchListEvent('list-events', { fetch: fetchedEvents })
      dispatchListEvent('list-filter-items', { fetch: fetchedEvents })
    }

    const displayFilter = (elementId) => {
      const filterList = this.root.getElementsByTagName('o-steps-filter-list')
      const listElement = filterList[0].shadowRoot.getElementById(elementId)
      listElement.classList.toggle('hidden')
    }
    this.displayFilterCompanies = () => displayFilter('list-companies')
    this.displayFilterLocations = () => displayFilter('list-locations')

    // inform about the url which would result on this filter
    this.requestHrefEventListener = event => {
      if (event.detail && event.detail.resolve) event.detail.resolve(this.setTag(event.detail.tags.join(';'), event.detail.pushHistory).href)
    }
    this.updatePopState = event => {
      if (!event.detail) event.detail = { ...event.state }
      event.detail.pushHistory = false
      this.requestListEventsListener(event)
    }
  }

  connectedCallback () {
    this.addEventListener(this.getAttribute('request-list-events') || 'request-list-events', this.requestListEventsListener)
    this.addEventListener(this.getAttribute('request-list-companies') || 'request-list-companies', this.displayFilterCompanies)
    this.addEventListener(this.getAttribute('request-list-locations') || 'request-list-locations', this.displayFilterLocations)
    this.addEventListener('request-href-' + (this.getAttribute('request-list-events') || 'request-list-events'), this.requestHrefEventListener)
    if (!this.hasAttribute('no-popstate')) self.addEventListener('popstate', this.updatePopState)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('request-list-events') || 'request-list-events', this.requestListEventsListener)
    this.removeEventListener(this.getAttribute('request-list-companies') || 'request-list-companies', this.displayFilterCompanies)
    this.removeEventListener(this.getAttribute('request-list-locations') || 'request-list-locations', this.displayFilterLocations)
    this.removeEventListener('request-href-' + (this.getAttribute('request-list-events') || 'request-list-events'), this.requestHrefEventListener)
    if (!this.hasAttribute('no-popstate')) self.removeEventListener('popstate', this.updatePopState)
  }

  /**
   * Set tag and page in window.history
   * @param {string} tag
   * @param {boolean} [pushHistory = true]
   * @return {URL}
   */
  setTag (tag, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    url.searchParams.set('tag', tag)
    if (pushHistory) history.pushState({ ...history.state, tag }, document.title, url.href)
    return url
  }

  /**
   * Get tag from url else store
   * @return string
   */
  getTags () {
    const urlParams = new URLSearchParams(location.search)
    const tag = urlParams.get('tag')
    if (tag) return tag
  }
}
