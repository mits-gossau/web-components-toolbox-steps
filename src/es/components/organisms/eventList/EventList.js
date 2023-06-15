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
        eventHtml += `
          <div class="event">
            <h2>${event.title}</h2>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Date:</strong> ${event.date}</p>
            <p>${event.description}</p>
          </div>
        `;
      });
  
      this.innerHTML = `
        <style>
          .event {
            margin-bottom: 1rem;
            padding: 1rem;
            background-color: #f3f3f3;
            border-radius: 0.5rem;
          }
          h2 {
            font-size: 1.5rem;
            margin-top: 0;
          }
        </style>
        ${eventHtml}
      `;
    }
  }
  
  customElements.define("event-list", EventList);
  