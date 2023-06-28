// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
 * EventList
 * An example at: src/es/components/pages/Program.html
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
        list-style: none;
        margin: 1.25rem 0;
        padding-left: 0;
      }
      :host .event-item {
        border-top: 1px solid var(--steps-color-black);
        padding: 1.25rem 0;
        display: flex;
        flex-direction: row;
        gap: 1rem;
        position: relative;
      }
      :host .event-item:last-child {
        border-bottom: 1px solid var(--steps-color-black)
      }
      :host .event-item p {
        margin: 0;
      }
      :host .event-date {
        white-space: nowrap;
        min-width: 28vw;
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
        hyphens: auto;
      }
      :host .legend-icons {
        display: inline-block;
        margin-right: 1.25rem;
        white-space: nowrap;
      }
      :host .event-cta {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 1.25rem;
        padding: 1.25rem 0;
        font-size: 1rem;
      }
      :host .event-cta a-button {
        width: 100%;
        white-space: nowrap;
      }
      :host .event-cta a {
        color: var(--steps-color-black);
        padding-top: var(--button-secondary-padding) ;
      }
      
      @media only screen and (min-width: 768px)  {
        :host .event-item { 
          gap: 2rem;
        }
        :host .event-date {
          min-width: 10vw;
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
        :host .event-cta {
          align-items: center;
          padding: 0;
        }
      }
    `
  }

  renderHTML () {
    let eventHtml = ''
    this.events.forEach((event) => {
      /* date and time */
      const timestamp = event.timestamp
      const weekDay = new Date(timestamp * 1000).toLocaleDateString('de-CH', {
        weekday: 'long'
      })
      const dateShort = new Date(timestamp * 1000).toLocaleDateString('de-CH', {
        day: 'numeric',
        month: 'numeric'
      })
      const time = new Date(timestamp * 1000).toLocaleTimeString('de-CH', {
        hour: '2-digit',
        minute: '2-digit'
      })

      /* icons */
      const eventIconsArray = event.icons
      let eventIcons = ''
      for (const icon of eventIconsArray) {
        eventIcons +=
          '<img src="../../img/icons/icon-' +
          icon +
          '.svg" class="legend-icon-' +
          icon +
          '" width="24" height="24" />'
      }
      const locationIconsArray = event.locationIcons
      let locationIcons = ''
      for (const icon of locationIconsArray) {
        locationIcons +=
          '<img src="../../img/icons/icon-' +
          icon +
          '.svg" class="legend-icon-' +
          icon +
          '" width="24" height="24" />'
      }

      /* buttons */
      const ctaButton = `<a-button namespace="button-secondary-">Tickets &#8594;</a-button>`
      const soldOutButton = `<a-button namespace="button-secondary-">ausverkauft</a-button>`

      eventHtml += /* html */ `
          <li class="event-item">
            <div class="event-date">
              <p>${weekDay}<br /><span>${dateShort}</span></p>
            </div>
            <div class="event-info">
              <p>
                <strong>${event.title}</strong><br />
                <span>${event.titleSubline}</span>
              </p>
              <p>
                <strong>${event.location}</strong><br />
                <span>${event.locationSubline}</span>
              </p>
              <p>
                ${time} Uhr<br />
                <br />
                <span class="legend-icons">
                  ${eventIcons}
                </span>
                <span class="legend-icons">
                  ${locationIcons}
                </span>
              </p>
              <p class="event-cta">
                ${event.soldOut ? soldOutButton : ctaButton}
                <a href="#">Mehr Details</a>
              </p>
            </div>
          </li>
        `
    })

    this.html = /* html */ `
        <ul class="event-list">
          ${eventHtml}
        </ul>
      `
  }
}
