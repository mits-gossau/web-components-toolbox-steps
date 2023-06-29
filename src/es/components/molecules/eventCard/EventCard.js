// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'
import(
  '../../web-components-toolbox/src/es/components/atoms/button/Button.js'
  // @ts-ignore
).then((module) => customElements.define('a-button', module.default))

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
    this.event = {}
    this.location = {}
    this.translationTexts = {}
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    this.event = {
      choreographer: this.getAttribute('choreographer'),
      company: this.getAttribute('company'),
      icons: this.getAttribute('eventIcons'),
      production: this.getAttribute('production'),
      soldOut: this.getAttribute('soldOut') === 'true',
      timestamp: this.getAttribute('timestamp'),
    }
    this.location = {
      name: this.getAttribute('location'),
      icons: this.getAttribute('locationIcons'),
      subline: this.getAttribute('locationSubline'),
    }
    this.translationTexts = {
      buttonTickets: this.getAttribute('textButtonTickets'),
      linkDetails: this.getAttribute('textLinkDetails'),
      soldOut: this.getAttribute('textSoldOut'),
      timeSuffix: this.getAttribute('textTimeSuffix'),
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
        :host .event-card { 
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
    // date and time
    const eventTimestamp = new Date(this.event.timestamp * 1000);

    const weekDay = eventTimestamp.toLocaleDateString('de-CH', { weekday: 'long' });
    const dateShort = eventTimestamp.toLocaleDateString('de-CH', { day: 'numeric', month: 'numeric' });
    const time = eventTimestamp.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });

    // icons
    const generateIconHTML = (iconsArray) => {
      let icons = '';
      for (const icon of iconsArray) {
        icons += `<img src="../../../../img/icons/icon-${icon}.svg" class="legend-icon-${icon}" width="24" height="24" />`;
      }
      return icons;
    };

    const eventIcons = generateIconHTML(JSON.parse(this.event.icons));
    const locationIcons = generateIconHTML(JSON.parse(this.location.icons));

    // buttons
    const ctaButton = `<a-button namespace="button-secondary-">${this.translationTexts.buttonTickets} &#8594;</a-button>`
    const soldOutButton = `<a-button namespace="button-secondary-">${this.translationTexts.soldOut}</a-button>`

    const eventInfoHtml = /* html */ `
      <div class="event-info">
        <p>
          <strong>${this.event.company}</strong><br />
          <span>${this.event.production}<br />${this.event.choreographer}</span>
        </p>
        <p>
          <strong>${this.location.name}</strong><br />
          <span>${this.location.subline}</span>
        </p>
        <p>
          ${time} ${this.translationTexts.timeSuffix}<br />
          <br />
          <span class="legend-icons">
            ${eventIcons}
          </span>
          <span class="legend-icons">
            ${locationIcons}
          </span>
        </p>
        <p class="event-cta">
          ${this.event.soldOut ? soldOutButton : ctaButton}
          <a href="#">${this.translationTexts.linkDetails}</a>
        </p>
      </div>
    `;

    this.html = /* html */ `
      <div class="event-card">
        <div class="event-date">
          <p>${weekDay}<br /><span>${dateShort}</span></p>
        </div>
        ${eventInfoHtml}
      </div>
    `;
  }
}
