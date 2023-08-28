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
      padding: '20px'
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
        :host {
            max-width: var(--steps-container-max-width, ${this.container.maxWidth});
            padding: var(--steps-container-padding, ${this.container.padding});
            padding-top: 1rem;
        }

        .spacer, .spacer-one, .spacer-two, .spacer-three, .spacer-four {
          display: block;
          height: 1px;
          margin: var(--spacer-margin, var(--content-spacing) auto) !important;
          padding: 0;
        }
        .spacer-one {
          margin: var(--spacer-margin, var(--content-spacing) auto 0) !important;
        }
        .spacer-two {
          height: var(--spacer-two-height, calc(2 * var(--content-spacing)));
        }
        .spacer-three {
          height: var(--spacer-three-height, calc(3 * var(--content-spacing)));
        }
        .spacer-four {
          height: var(--spacer-four-height, calc(4 * var(--content-spacing)));
        }

        @media only screen and (max-width: 767px) {
          .spacer, .spacer-one, .spacer-two, .spacer-three, .spacer-four {
            margin: var(--spacer-margin-mobile, var(--spacer-margin, var(--content-spacing-mobile, var(--content-spacing)) auto)) !important;
          }
          .spacer-one {
            margin: var(--spacer-margin-mobile, var(--spacer-margin, var(--content-spacing-mobile, var(--content-spacing)) auto 0)) !important;
          }
          .spacer-two {
            height: var(--spacer-two-height-mobile, var(--spacer-two-height, calc(2 * var(--content-spacing-mobile, var(--content-spacing)))));
          }
          .spacer-three {
            height: var(--spacer-three-height-mobile, var(--spacer-three-height, calc(3 * var(--content-spacing-mobile, var(--content-spacing)))));
          }
          .spacer-four {
            height: var(--spacer-four-height-mobile, var(--spacer-four-height, calc(4 * var(--content-spacing-mobile, var(--content-spacing)))));
          }
        }
    `
  }
}
