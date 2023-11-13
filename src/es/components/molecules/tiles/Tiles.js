// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
 * Tiles
 * An example at: src/es/components/pages/Home.html
 *
 * @export
 * @class Tiles
 * @type {CustomElementConstructor}
 */

export default class Tiles extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
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
        padding-bottom: var(--component-spacing);
      }
      
      :host .tiles__wrapper {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }

      :host .tiles__tile {
        width: 48%;
        margin-bottom: 2rem;
        position: relative;
        overflow: hidden;
        color: var(--steps-color-white);
      }

      :host .tiles__tile--full {
        width: 100%;
      }

      :host .tiles__tile:nth-child(odd) {
        margin-right: 2rem;
      }

      :host .tiles__tile--full:nth-child(odd) {
        margin-right: 1rem;
      }

      :host .tiles__tile:nth-child(even) {
        margin-right: 0;
      }

      :host .tiles__title {
        position: absolute;
        top: 0.5rem;
        left: 2rem;
        width: auto;
        font-family: var(--h-font-family);
        font-size: 30px;
        line-height: 35px;
        padding-right: 2rem;
        z-index: 10;
      }

      @media (max-width: 768px) {
        :host .tiles__wrapper {
          flex-direction: column;
        }

        :host .tiles__tile {
          width: 100%;
          margin-right: 0;
          margin-bottom: 1rem;
        }
      }
    `
  }
}
