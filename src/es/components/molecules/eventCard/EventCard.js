// @ts-check
import { Shadow } from "../../web-components-toolbox/src/es/components/prototypes/Shadow.js";

/**
 * EventCard
 * An example at: src/es/components/pages/Event.html
 *
 * @export
 * @class EventCard
 * @type {CustomElementConstructor}
 */

export default class EventCard extends Shadow() {
  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args);
    /**
     * @typedef {Object} Event
     * @property {string} choreographer - The name of the choreographer.
     * @property {string} company - The name of the company.
     * @property {string} eventDate - The date and time of the event.
     * @property {string[]} eventInformationIcons - An array of event information icons.
     * @property {string} location - The location name.
     * @property {string} production - The production title.
     * @property {string} soldOut - Indicates whether the event is sold out.
     * @property {string} theater - The theater name.
     * @property {string[]} theaterInformationIcons - An array of theater information icons.
     */
    /**
     * @type {Event}
     */
    this.event = {
      choreographer: "",
      company: "",
      eventDate: "",
      eventInformationIcons: [],
      location: "",
      production: "",
      soldOut: "",
      theater: "",
      theaterInformationIcons: [],
    };
  }

  connectedCallback() {
    if (this.shouldRenderCSS()) {
      this.renderCSS();
    }

    // properties
    this.event = {
      choreographer: this.getAttribute("choreographer"),
      company: this.getAttribute("company"),
      eventDate: this.getAttribute("eventDate"),
      eventInformationIcons: JSON.parse(
        this.getAttribute("eventInformationIcons")
      ),
      location: this.getAttribute("location"),
      production: this.getAttribute("production"),
      soldOut: this.getAttribute("soldOut"),
      theater: this.getAttribute("theater"),
      theaterInformationIcons: JSON.parse(
        this.getAttribute("theaterInformationIcons")
      ),
    };

    this.renderHTML();
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(
      `:host > style[_css], ${this.tagName} > style[_css]`
    );
  }

  renderCSS() {
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
    `;
  }

  renderHTML() {
    // date and time
    const dateString = this.event.eventDate;
    const dateParts = dateString.split(".");
    const timeParts = dateParts[2].split(" ");
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const year = parseInt(timeParts[0]);
    const eventTime = timeParts[1];
    const [hours, minutes, seconds] = eventTime.split(":").map(Number);
    const eventTimestamp = new Date(year, month, day, hours, minutes, seconds);

    const weekDay = eventTimestamp.toLocaleDateString("de-CH", {
      weekday: "long",
    });
    const dateShort = eventTimestamp.toLocaleDateString("de-CH", {
      day: "numeric",
      month: "numeric",
    });
    const time = eventTimestamp.toLocaleTimeString("de-CH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // icons
    const generateIconHTML = (iconsArray) => {
      let icons = "";
      for (const icon of iconsArray) {
        icons += `<img src="../../../../img/icons/icon-${icon}.svg" class="legend-icon-${icon}" width="24" height="24" />`;
      }
      return icons;
    };

    const eventIcons = generateIconHTML(this.event.eventInformationIcons);
    const theaterIcons = generateIconHTML(this.event.theaterInformationIcons);

    // buttons
    const buttonTickets = `<a-button namespace="button-secondary-">${this.getAttribute(
      "textButtonTickets"
    )} &#8594;</a-button>`;
    const buttonSoldOut = `<a-button namespace="button-secondary-">${this.getAttribute(
      "textSoldOut"
    )}</a-button>`;
    const buttonCta =
      this.event.soldOut === "True" ? buttonSoldOut : buttonTickets;

    const eventInfoHtml = /* html */ `
      <div class="event-info">
        <p>
          <strong>${this.event.company}</strong><br />
          <span>${this.event.production}<br />${this.event.choreographer}</span>
        </p>
        <p>
          <strong>${this.event.location}</strong><br />
          <span>${this.event.theater}</span>
        </p>
        <p>
          ${time} ${this.getAttribute("textTimeSuffix")}<br />
          <br />
          <span class="legend-icons">
            ${eventIcons}
          </span>
          <span class="legend-icons">
            ${theaterIcons}
          </span>
        </p>
        <p class="event-cta">
          ${buttonCta}
          <a href="#">${this.getAttribute("textLinkDetails")}</a>
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
