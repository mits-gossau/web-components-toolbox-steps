// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
 * Addresses
 * An example at: src/es/components/pages/Addresses.html
 *
 * @export
 * @class Addresses
 * @type {CustomElementConstructor}
 */

export default class Addresses extends Shadow() {
  // @ts-ignore
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    this.apiUrl = this.getAttribute('api-url')
    this.loadData()
    if (this.shouldRenderCSS()) this.renderCSS()
  }

  /**
   * load addresses from api
   */
  async loadData () {
    const response = await fetch(this.apiUrl)
    const result = await response.json()
    const addresses = result.addresses
    this.renderHTML(addresses)
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
          padding: 3rem 0 var(--component-spacing);
          display: flex;
          flex-wrap: wrap;
          font-family: "HelveticaNowText";
        }
        
        :host .address-item {
          width: 50%;
          margin-bottom: 2rem;
          font-style: normal;
        }

        :host h2 {
          font-family: PPMonumentExtended, Helvetica, Arial, sans-serif;
          margin: 0;
          font-size: var(--steps-h-font-size-small);
          padding: 0.5rem 0 0.5rem;
          line-height: 30px;
        }

        :host p {
          margin: 0;
          font-size: 17px;
          line-height: 21px;
          font-family: "NeueAugenblickMedium";
        }

        :host .address-name {
          color: var(--steps-color-red);
          margin: 0;
        }

        :host .address-phone {
          color: var(--steps-color-black);
          text-decoration: none;
        }

        :host .address-link {
          color: var(--steps-color-black);
          display: inline-block;
          padding-top: 0.5rem;
          font-weight: bold;
          font-family: "NeueAugenblickBold";
        }

        :host .address-icons {
          display: inline-block;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          :host {
            padding-top: 1.5rem;
          }

          :host h2 {
            font-size: 20px;
            line-height: 25px;
          }

          :host .address-item {
              width: 100%;
          }
        }
    `
  }

  /**
   * Loop through loaded addresses and concat markup
   *
   * @param {*} addresses
   */
  renderHTML (addresses) {
    let addressesMarkup = ''
    // @ts-ignore
    addresses.forEach(address => {
      let newAddress = /* html */`
        <address class="address-item">
          <p class="address-city">${address.theatercity}</p>
          <h2 class="address-name">${address.theatername}</h2>
          <p class="address-street">${address.theaterstreet}<br />
          <a class="address-phone" href="tel:${address.theaterphone}">${address.theaterphone}</a><br />
          <strong><a class="address-link" href="${address.theaterurl}" target="_blank">${address.theaterurltitle} →</a></strong><br />
          ${address.accessibilityurl
            ? `<strong><a class="address-link" href="${address.accessibilityurl}" target="_blank">${address.accessibilityurltitle} →</a></strong><br />`
            : ''
          }       
          ${address.optionalyurl
            ? `<strong><a class="address-link" href="${address.optionalurl}" target="_blank">${address.optionalurltitle} →</a></strong><br />`
            : 'nix'
          }               
          </p>
          ${address.theaterInformationIcons
            ? `<p><span class="address-icons">${this.collectIcons(address.theaterInformationIcons)}</span></p>`
            : ''
          }
        </address>        
      `

      addressesMarkup = addressesMarkup.concat(' ', newAddress)
      newAddress = ''
    })

    this.html = addressesMarkup
  }

  /**
   * Loop icons and collect markup
   *
   * @param {*} icons
   * @returns iconMarkup
   */
  collectIcons (icons) {
    let iconMarkup = ''
    // @ts-ignore
    icons.forEach(icon => {
      let newIcon = /* html */`
        <img src="${icon.src}" alt="${icon.alt}" width="24" height="24">
      `

      iconMarkup = iconMarkup.concat(' ', newIcon)
      newIcon = ''
    })

    return iconMarkup
  }
}
