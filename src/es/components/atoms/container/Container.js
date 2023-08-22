// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
 * Container
 * An example at: src/es/components/pages/Spielplan.html
 *
 * @export
 * @class Container
 * @type {CustomElementConstructor}
 */

export default class Container extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    /**
     * Represents an heading.
     * @typedef {object} Container
     * @property {string} maxWidth - maximal width
     * @property {string} padding - padding 
     */
    /**
     * @type {Container}
     */
    this.container = {
      maxWidth: '960px',
      padding: '20px',
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()

    this.container = {
      maxWidth: this.getAttribute('maxWidth') || this.container.maxWidth,
      padding: this.getAttribute('padding') || this.container.padding
    }
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
        @import url("../../web-components-toolbox/src/css/style.css");

        :host {
            max-width: var(--steps-container-max-width, ${this.container.maxWidth});
            padding: var(--steps-container-padding, ${this.container.padding});
            padding-top: 3rem;
        }
    `
  }
}
