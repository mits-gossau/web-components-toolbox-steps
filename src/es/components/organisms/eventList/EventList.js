import(
  "../../web-components-toolbox/src/es/components/atoms/button/Button.js"
).then((module) => self.customElements.define("a-button", module.default));

class EventList extends HTMLElement {
  constructor() {
    super();
    this.events = [];
  }

  connectedCallback() {
    const jsonUrl = this.getAttribute("json-url");
    fetch(jsonUrl)
      .then((response) => response.json())
      .then((data) => {
        this.events = data;
        this.render();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    let eventHtml = "";
    this.events.forEach((event) => {
      /* date and time */
      const timestamp = event.timestamp;
      const weekDay = new Date(timestamp * 1000).toLocaleDateString("de-CH", {
        weekday: "long",
      });
      const dateShort = new Date(timestamp * 1000).toLocaleDateString("de-CH", {
        day: "numeric",
        month: "numeric",
      });
      const time = new Date(timestamp * 1000).toLocaleTimeString("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
      });

      /* icons */
      const eventIconsArray = event.icons;
      let eventIcons = "";
      for (const icon of eventIconsArray) {
        eventIcons +=
          '<img src="../../../img/icons/icon-' +
          icon +
          '.svg" class="legend-icon-' +
          icon +
          '" width="24" height="24" />';
      }
      const locationIconsArray = event.location_icons;
      let locationIcons = "";
      for (const icon of locationIconsArray) {
        locationIcons +=
          '<img src="../../../img/icons/icon-' +
          icon +
          '.svg" class="legend-icon-' +
          icon +
          '" width="24" height="24" />';
      }

      eventHtml += /*html*/ `
          <li class="${event.sold_out ? "sold-out event-item" : "event-item"}">
            ${
              event.sold_out
                ? '<p class="badge-sold-out">aus&shy;verkauft</p>'
                : ""
            }
            <div class="event-date">
              <p><span>${weekDay}</span>${dateShort}</p>
            </div>
            <div class="event-info">
              <p>
                <strong>${event.title}</strong><br />
                <span>${event.title_subline}</span>
              </p>
              <p>
                <strong>${event.location}</strong><br />
                <span>${event.location_subline}</span>
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
                <a-button namespace="button-secondary-">Tickets &#8594;</a-button>
                <a href="#">Mehr Details</a>
              </p>
            </div>
          </li>
        `;
    });

    this.innerHTML = /* html */ `
        <style>
          :host {
            --button-secondary-width: 100%;
            --event-plan-date-font-size: calc(2.5rem + 1vw);
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
            gap: 2rem;
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
            font-size: var(--event-plan-date-font-size);
          }
          :host .event-date span {
            display: block;
            font-size: 1.4rem;
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
            font-size: var(--font-size);
          }
          :host .event-cta a-button {
            width: 100%;
            white-space: nowrap;
          }
          :host .event-cta a {
            padding: var(--button-secondary-padding);
            padding-left: 0;
          }
          :host .sold-out {
            color: var(--m-gray-400);
            cursor: not-allowed;
          }
          :host .sold-out .event-cta,
          :host .sold-out img[src*="svg"] {
            opacity: 0.4;
          }
          :host .sold-out .event-cta a-button {
            display: none;
          }
          :host .badge-sold-out {
            background-color: var(--steps-color-white);
            border: 2px dashed var(--steps-color-red);
            color: var(--steps-color-red);
            display: inline-block;
            padding: 1.25rem;
            position: absolute;
            top: calc(50% - 32.5px);
            left: calc(50% - 100px);
            text-align: center;
            transform: rotate(2deg);
            width: 200px;
            z-index: 2;
          }
          
          @media only screen and (min-width: 768px)  {
            :host .event-item { 
              gap: 4rem;
            }
            :host .event-date {
              min-width: 10vw;
            }
            :host .event-info {
              flex-direction: row;
              justify-content: space-between;
            }
            :host .event-info > * {
              flex-basis: 20%;
            }
            :host .event-cta {
              align-items: center;
              padding: 0;
            }
            :host .event-cta a {
              padding-left: var(--button-secondary-padding);
            }
          }
        </style>
        <ul class="event-list">
          ${eventHtml}
        </ul>
      `;
  }
}

customElements.define("event-list", EventList);
