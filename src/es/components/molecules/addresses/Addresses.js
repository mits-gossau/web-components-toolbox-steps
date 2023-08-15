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
        }
        
        :host .address-item {
            width: 50%;
            margin-bottom: 2rem;
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
      let newAddress = `
        <address class="address-item">
          <p>${address.theatercity}</p>
          <h2>${address.theatername}</h2>
          <p>Adresse<br />
          <a href="tel:${address.theaterphone}">${address.theaterphone}</a><br />
          <strong><a href="${address.theaterurl}" target="_blank">${address.theaterurl}</a></strong><br />
          </p>
        </address>        
      `;

      addressesMarkup = addressesMarkup.concat(' ', newAddress);
      newAddress = '';
    });

    this.html = addressesMarkup;
  }
}
