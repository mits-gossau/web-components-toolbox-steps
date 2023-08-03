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

    this.answerEventListener = (event) => {
      event.detail.fetch.then((data) => this.renderHTML(data)) 
    }

    this.companiesLoaded = false
    this.locationsLoaded = false



    this.clickListener = (event) => {
      event.preventDefault()
      let company = ''
      let location = ''
      const elementId = event.target.id
      const listId = event.target.parentElement.parentElement.id
      console.log(event, event.detail, elementId, listId)

      if (listId === "list-companies") {
        company = elementId
      }
      if (listId === "list-locations") {
        location = elementId
      }
      
      if (this.hasAttribute('disabled')) {
        event.preventDefault()
        return
      }

      if (this.getAttribute('request-event-name')) {
        this.dispatchEvent(
          new CustomEvent(this.getAttribute('request-event-name'), {
            detail: {
              company,
              location
            },
            bubbles: true,
            cancelable: true,
            composed: true
          })
        )
      }

      this.answerEventListener = async (event) => {
        event.detail.fetch.then(data => {
          console.log('data:', data)
        })
      }

      this.closeEventListener = (event) => {
        this.dispatchEvent(
          new CustomEvent(this.getAttribute('request-event-name'), {
            bubbles: true,
            cancelable: true,
            composed: true
          })
        )
      }
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()

    if (this.companiesLoaded && this.locationsLoaded) {
      this.renderHTML()
    }

    document.body.addEventListener(
      this.getAttribute('answer-event-name') || 'answer-event-name',
      this.answerEventListener
    )

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
      this.answerEventListener
    )
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
      :host .list-items {
        list-style: none;
        margin: 1.25rem 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
      :host .hidden {
        display: none;
      }
    `
  }

  renderHTML(data) {
    const createList = (data, id, attributeClass) => {
      let ul = document.createElement('ul')
      ul.setAttribute('id', id)
      ul.setAttribute('class', attributeClass + ' hidden')

      data.forEach(item => {
        const li = document.createElement('li')
        const button = document.createElement('a-steps-button')
        button.setAttribute('id', item)
        button.addEventListener('click', this.clickListener)
        button.setAttribute('namespace','button-category-')
        button.textContent = item
        li.appendChild(button)
        ul.appendChild(li)
      })

      return ul
    }

    let companies = createList(data.companies, 'list-companies', 'list-items')
    let locations = createList(data.locations, 'list-locations', 'list-items')

    const filterList = document.createElement('div')
    filterList.setAttribute('class', 'filter-list')
    filterList.appendChild(companies)
    filterList.appendChild(locations)

    this.html = ''
    this.html = filterList
  }
}
