// @ts-check
import { Shadow } from '../../web-components-toolbox/src/es/components/prototypes/Shadow.js'

/**
 * Heading
 * An example at: src/es/components/pages/Home.html
 *
 * @export
 * @class Heading
 * @type {CustomElementConstructor}
 */

export default class Heading extends Shadow() {
  // @ts-ignore
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    /**
     * Represents an heading.
     * @typedef {object} Heading
     * @property {string} tag - The heading tag.
     * @property {string} type - The heading type.
     * @property {string} text - The heading text.
     * @property {string} className - A heading custom class.
     * @property {boolean} isSmall - The heading text styling small.
     */
    /**
     * @type {Heading}
     */
    this.heading = {
      tag: 'h1',
      type: 'h1',
      text: 'I am a default heading',
      className: '',
      isSmall: false
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()

    this.heading = {
      tag: this.getAttribute('tag') || this.heading.tag,
      type: this.getAttribute('type') || this.heading.type,
      text: this.getAttribute('text') || this.heading.text,
      className: this.getAttribute('className'),
      isSmall: this.getAttribute('isSmall') || false
    }

    if (this.shouldRenderHTML()) this.renderHTML()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
 * evaluates if a render is necessary
 *
 * @return {boolean}
 */
  shouldRenderHTML () {
    return !this.root.querySelector('.heading')
  }

  renderCSS () {
    this.css = /* css */`
        :host .heading {
            font-size: 40px;
            line-height: 45px;
            margin: 0;
            padding-bottom: 1rem !important;
            font-family: PPMonumentExtended, Helvetica, Arial, sans-serif;
        }

        :host .heading--h1 {
            color: var(--steps-color-black);
            margin: 0 0 45px 0;
        }

        :host .heading--h2 {
            color: var(--steps-color-red);
        }

        :host .heading--h3 {
            color: var(--steps-color-white);
        }

        :host .heading--small {
            font-size: var(--steps-h-font-size-small);
            padding-bottom: 0.5rem;
            line-height: 30px;
        }

        :host .heading--margin-top {
          margin: 35px 0;
        }

        @media (max-width: 768px) {
          :host .heading {
            font-size: 30px;
            line-height: 35px;
          }

          :host .heading--h1 {
            margin: 0 0 35px 0;
          }

          :host .heading--small {
            font-size: 20px;
            line-height: 25px;
          }

          :host .heading--margin-top {
            margin: 25px 0;
          }
        }
    `
  }

  renderHTML () {
    this.html = /* html */ `
        <${this.heading.tag} class="heading heading--${this.heading.type}${this.heading.className ? ` ${this.heading.className}` : ''}${this.heading.isSmall ? ' heading--small' : ''}">
            ${this.heading.text}
        </${this.heading.tag}>
    `
  }
}
