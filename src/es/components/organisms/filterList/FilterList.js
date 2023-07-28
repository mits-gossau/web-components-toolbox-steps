// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
 * FilterList
 * An example at: src/es/components/pages/Spielplan.html
 *
 * @export
 * @class FilterList
 * @type {CustomElementConstructor}
 */

export default class FilterList extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.companies = []
    this.locations = []

    this.answerEventNameListener = (event) => {
      event.detail.fetch.then((data) => this.renderHTML(data)) 
    }

    this.companiesLoaded = false
    this.locationsLoaded = false

    this.selectListener = (event) => {
      event.preventDefault()
      console.log(event, event.detail)
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()

    if (this.companiesLoaded && this.locationsLoaded) {
      this.renderHTML()
    }

    document.body.addEventListener(
      this.getAttribute('answer-event-name') || 'answer-event-name',
      this.answerEventNameListener
    )

    this.addEventListener("click", this.selectListener)



    // document.body.addEventListener(
    //   this.getAttribute('answer-event-name') || 'answer-event-name',
    //   this.answerEventNameListener
    // )

    // this.addEventListener(this.getAttribute('request-list-filter-items') || 'request-list-filter-items', () => {
    //   console.log('Compagnien clicked!')
    //   // this.shadowRoot.getElementById('list-companies')?.classList.toggle('open')
    // })



    this.dispatchEvent(
      new CustomEvent(this.getAttribute('request-event-name'), {
        bubbles: true,
        cancelable: true,
        composed: true
      })
    )
  }

  disconnectedCallback () {
    document.body.removeEventListener(
      this.getAttribute('answer-event-name') || 'answer-event-name',
      this.answerEventNameListener
    )

    this.removeEventListener("click", this.selectListener)
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
      :host .filter-list {  
      }
      :host .list-items {
        list-style: none;
        margin: 1.25rem 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
      :host .list-items.open {
        display: flex
      }
    `
  }

  renderHTML(data) {
    const createList = (data, id, attributeClass) => {
      let ul = document.createElement('ul');
      ul.setAttribute('id', id);
      ul.setAttribute('class', attributeClass);

      data.forEach(item => {
        const li = document.createElement('li');
        const button = document.createElement('a-button');
        button.textContent = item;
        li.appendChild(button);
        ul.appendChild(li);
      });

      return ul;
    };

    let companies = createList(data.companies, 'list-companies', 'list-items');
    let locations = createList(data.locations, 'list-locations', 'list-items');

    const filterList = document.createElement('div');
    filterList.setAttribute('class', 'filter-list');
    filterList.appendChild(companies);
    filterList.appendChild(locations);

    this.html = '';
    this.html = filterList;
  }
}