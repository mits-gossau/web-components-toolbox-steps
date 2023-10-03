// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

export default class FilterList extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.answerEventListener = this.answerEventListener.bind(this)
    this.clickListener = this.clickListener.bind(this)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()

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

    const cleanFilterButton = this.root.querySelector('#filter-button-companies');
    console.log(cleanFilterButton)

    cleanFilterButton.addEventListener('click', () => {
      console.log('clean filter!');
    })
  }

  disconnectedCallback () {
    document.body.removeEventListener(
      this.getAttribute('answer-event-name') || 'answer-event-name',
      this.answerEventListener
    )
  }

  answerEventListener (event) {
    event.detail.fetch.then((data) => this.renderHTML(data))
  }

  clickListener (event) {
    event.preventDefault()
    const elementId = event.target.id
    const listId = event.target.parentElement.parentElement.id
    console.log(event, event.detail, elementId, listId)

    const company = listId === 'list-companies' ? elementId : ''
    const location = listId === 'list-locations' ? elementId : ''

    if (this.hasAttribute('disabled')) {
      event.preventDefault()
      return
    }

    /*if (this.getAttribute('request-event-name')) {
      this.dispatchEvent(
        new CustomEvent(this.getAttribute('request-event-name'), {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: { company, location }
        })
      )
    }*/

    this.dispatchEvent(
      new CustomEvent('filter-events', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: { elementId }
      })
    )
  }

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

  renderHTML (data) {
    const createList = (items, id, className) =>
      this.createHTMLElement(
        'ul',
        { id, class: `${className} hidden` },
        items.map((item) =>
          this.createHTMLElement('li', {},
            [
              this.createHTMLElement('a-button', // TODO: create a-steps-button
                {
                  id: item,
                  namespace: 'button-category-',
                  onClick: this.clickListener
                },
                [item]
              )
            ]
          )
        )
      )
    
    /* Remove duplicate items */
    let cleanedCompanies = Array.from(new Set(data.companies))
    let cleanedLocations = Array.from(new Set(data.locations))

    const companies = createList(cleanedCompanies, 'list-companies', 'list-items')
    const locations = createList(cleanedLocations, 'list-locations', 'list-items')

    const filterList = this.createHTMLElement(
      'div', { class: 'filter-list' }, [companies, locations]
    )

    this.html = filterList
  }

  createHTMLElement (tag, attributes = {}, children = []) {
    const element = document.createElement(tag)

    Object.keys(attributes).forEach((key) => {
      if (key === 'onClick') {
        element.addEventListener('click', attributes[key])
      } else {
        element.setAttribute(key, attributes[key])
      }
    })

    children.forEach((child) => {
      if (typeof child !== 'string') {
        element.appendChild(child)
      } else {
        element.textContent = child
      }
    })

    return element
  }
}
