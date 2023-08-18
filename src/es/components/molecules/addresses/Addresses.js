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
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args);
  }

  connectedCallback () {
    this.apiUrl = this.getAttribute('api-url');
    this.loadData();
    if (this.shouldRenderCSS()) this.renderCSS();
  }

  /**
   * load addresses from api
   */
  async loadData() {
    const response = await fetch(this.apiUrl);
    const result = await response.json();
    const addresses = result.addresses;
    this.renderHTML(addresses);
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`);
  }

  renderCSS () {
    this.css = /* css */`
        :host {
            padding-bottom: var(--component-spacing);
            display: flex;
            flex-wrap: wrap;
            font-family: "HelveticaNowText";
        }
        
        :host .address-item {
            width: 50%;
            margin-bottom: 2rem;
            font-style: normal;
        }

        :host p {
          margin: 0;
        }

        :host .address-name {
          color: var(--steps-color-blue);
          margin: 0;
        }

        :host .address-phone {
          color: var(--steps-color-black);
          text-decoration: none;
        }

        :host .address-link {
          color: var(--steps-color-black);
          font-family: "HelveticaNowTextBold";
        }

        :host .address-icons {
          display: inline-block;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
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
    let addressesMarkup = '';
    addresses.forEach(address => {
      let newAddress = /* html */`
        <address class="address-item">
          <p class="address-city">${address.theatercity}</p>
          <h2 class="address-name">${address.theatername}</h2>
          <p class="address-street">${address.theaterstreet}<br />
          <a class="address-phone" href="tel:${address.theaterphone}">${address.theaterphone}</a><br />
          <strong><a class="address-link" href="${address.theaterurl}" target="_blank">${address.theaterurltitle} →</a></strong><br />
          </p>
          ${address.theaterInformationIcons
            ? `<p><span class="address-icons">${this.collectIcons(address.theaterInformationIcons)}</span></p>`
            : ''
          }
        </address>        
      `;

      addressesMarkup = addressesMarkup.concat(' ', newAddress);
      newAddress = '';
    });

    this.html = addressesMarkup;
  }

  /**
   * Loop icons and collect markup
   * 
   * @param {*} icons 
   * @returns iconMarkup
   */
  collectIcons (icons) {
    let iconMarkup = '';
    icons.forEach(icon => {
      let newIcon = /* html */`
        <img src="${icon}" width="24" height="24">
      `;

      iconMarkup = iconMarkup.concat(' ', newIcon);
      newIcon = ''
    });

    return iconMarkup;
  }
}
