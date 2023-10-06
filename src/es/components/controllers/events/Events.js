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

    this.requestListEventsListener = event => {
      console.log('requestListEventsListener', event, this.fetch);
      this.dispatchEvent(new CustomEvent('list-events', {
        detail: {
          fetch: this.fetch.then(result => ({
            events: event.detail
              ? result.events.filter(resultEvent => {
                const filterType = event.detail?.this.getAttribute('filter-type')
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
          fetch: this.fetch.then(result => event.detail.isActive
            ? event.detail.tags.includes('companies')
              ? {
                items: result.companies,
                filterType: 'company'
              }
              : {
                items: result.locations,
                filterType: 'location'
              }
            : []
          )
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    // inform about the url which would result on this filter
    /*
    this.requestHrefEventListener = event => {
      if (event.detail && event.detail.resolve) event.detail.resolve(this.setTag(event.detail.tags.join(';'), event.detail.pushHistory).href)
    }
    */
    /*
    this.updatePopState = event => {
      if (!event.detail) event.detail = { ...event.state }
      event.detail.pushHistory = false
      this.requestListEventsListener(event)
    }
    */
  }

  connectedCallback () {
    this.addEventListener('request-list-events', this.requestListEventsListener)
    this.addEventListener('request-list-filter-items', this.requestListFilterItemsEventsListener)
    /*
    this.addEventListener('request-href-' + 'request-list-events', this.requestHrefEventListener)
    if (!this.hasAttribute('no-popstate')) self.addEventListener('popstate', this.updatePopState)
    */
  }

  disconnectedCallback () {
    this.removeEventListener('request-list-events', this.requestListEventsListener)
    this.removeEventListener('request-list-filter-items', this.requestListFilterItemsEventsListener)
    /*
    this.removeEventListener('request-href-' + 'request-list-events', this.requestHrefEventListener)
    if (!this.hasAttribute('no-popstate')) self.removeEventListener('popstate', this.updatePopState)
    */
  }

  /**
   * Set tag and page in window.history
   * @param {string} tag
   * @param {boolean} [pushHistory = true]
   * @return {URL}
   */
  /*
  setTag (tag, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    url.searchParams.set('tag', tag)
    if (pushHistory) history.pushState({ ...history.state, tag }, document.title, url.href)
    return url
  }
  */

  /**
   * Get tag from url else store
   * @return string
   */
  /*
  getTags () {
    const urlParams = new URLSearchParams(location.search)
    const tag = urlParams.get('tag')
    if (tag) return tag
  }
  */

  get fetch () {
    return this._fetch || (this._fetch = fetch(this.getAttribute('endpoint'), {
      method: 'GET'
    }).then(async response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }

      let { events, translations } = await response.json()

      // Sort events by date
      function convertAndSortDates (events) {
        const currentDate = new Date()

        for (const event of events) {
          const parts = event.eventDate.split(' ')
          const partDate = parts[0].split('.')
          const partTime = parts[1].split(':')
          const formattedDate = `${partDate[2]}-${('0' + partDate[1]).slice(-2)}-${('0' + partDate[0]).slice(-2)}T${('0' + partTime[0]).slice(-2)}:${('0' + partTime[1]).slice(-2)}`
          event.formattedDate = formattedDate
          event.parsedDate = new Date(formattedDate)
        }

        events.sort((a, b) => {
          // If both events are in the future or both events are in the past, sort them by date.
          if ((a.parsedDate >= currentDate && b.parsedDate >= currentDate) || (a.parsedDate < currentDate && b.parsedDate < currentDate)) {
            return a.parsedDate - b.parsedDate
          }
          
          // If the first event is in the past and the second is in the future, place the first event after the second.
          if (a.parsedDate < currentDate && b.parsedDate >= currentDate) {
            return 1
          }
          
          // If the first event is in the future and the second is in the past, place the first event before the second.
          if (a.parsedDate >= currentDate && b.parsedDate < currentDate) {
            return -1
          }
        });

        for (const event of events) {
          delete event.formattedDate
          delete event.parsedDate
        }

        return events
      }

      events = convertAndSortDates(events)

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
      /*
      if (event.detail?.date) {
        events = events.filter(eventArray => eventArray.eventDate.includes(event.detail.date))
      }
      */

      return {
        events,
        translations,
        min: formattedMinDate,
        max: formattedMaxDate,
        companies,
        locations
        // days: [1,2,3,4,8,9], months, years
      }
    }))
  }
}
