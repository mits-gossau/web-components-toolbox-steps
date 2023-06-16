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
      const icons = event.icons;
      let iconImages = "";
      for (const icon of icons) {
        iconImages +=
          '<img src="../../../img/icons/icon-' +
          icon +
          '.svg" class="legend-icon-' +
          icon +
          '" width="24" height="24" />';
      }

      /* badge */
      const soldOut = event.sold_out;
      const soldOutMessage = soldOut
        ? '<p class="badge-sold-out">aus&shy;verkauft</p>'
        : "";

      eventHtml += /*html*/ `
          <li class="event-item">
            ${soldOutMessage}
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
                  ${iconImages}
                </span>
              </p>
              <p class="event-buttons">
                <a-button namespace="button-secondary-">Info &#8594;</a-button>
                <a-button namespace="button-secondary-">Tickets &#8594;</a-button>
              </p>
            </div>
          </li>
        `;
    });

    this.innerHTML = /* html */ `
        <style>
          :host {
            --button-secondary-width: 100%;
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
            min-width: 100px;
            white-space: nowrap;
          }
          :host .event-date p {
            font-size: var(--h1-font-size);
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
            white-space: nowrap;
          }
          :host .legend-icon-hoerbenachteiligung,
          :host .legend-icon-nicht-rollstuhlgaengig {
            margin-left: 1.25rem;
          }
          :host .legend-icon-hoerbenachteiligung +
          .legend-icon-nicht-rollstuhlgaengig {
            margin-left: 0;
          }
          :host .event-buttons {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 1.25rem;
          }
          :host .event-buttons a-button {
            width: 100%;
            white-space: nowrap;
          }
          :host .sold-out {
            color: var(--m-gray-400);
            cursor: not-allowed;
          }
          :host .sold-out .event-buttons,
          :host .sold-out img[src*="svg"] {
            opacity: 0.4;
          }
          :host .sold-out .event-buttons a-button:last-child {
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
          }
          
          @media only screen and (min-width: 768px)  {
            :host .event-item { 
              gap: 4rem;
            }
            :host .event-date {
              min-width: 150px;
            }
            :host .event-info {
              flex-direction: row;
              justify-content: space-between;
            }
            :host .event-info > * {
              flex-basis: 20%;
            }
            :host .event-buttons {
              align-items: center;
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
