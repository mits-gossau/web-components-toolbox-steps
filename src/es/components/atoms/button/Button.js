// @ts-check
import { Hover } from '../../web-components-toolbox/src/es/components/prototypes/Hover.js'

/* global CustomEvent */

/**
 * Creates an Button
 * https://www.figma.com/file/npi1QoTULLWLTGM4kMPUtZ/Components-Universal?node-id=2866%3A55901
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class Button extends Hover() {
  static get observedAttributes () {
    return ['label', 'disabled']
  }

  constructor (options = {}, ...args) {
    // @ts-ignore
    super({ hoverInit: undefined, importMetaUrl: import.meta.url, ...options }, ...args)

    // get the original innerHTML of the component, so that when it rerenders as an a-tag it doesn't loose its content
    let button
    // incase there is already a button, grab the buttons innerHTML, since renderHTML is going to create a new button resp. a-tag instead of the button
    if ((button = this.root.querySelector('button'))) {
      if (this.label) {
        if (this.label.textContent.length && this.label.textContent.trim().length) this.labelText = this.label.textContent.trim()
        this.label.remove()
      }
      this.origInnerHTML = button.innerHTML
      button.remove()
    } else {
      this.origInnerHTML = this.root.innerHTML
    }

    window.document.onscroll = () => {
      if (this.hasAttribute('scroll-to-top')) {
        if (document.body.scrollTop > 10 || document.documentElement.scrollTop >= 10) {
          this.button.style.display = 'block'
        } else {
          this.button.style.display = 'none'
        }
      }
    }

    this.clickListener = event => {
      if (this.hasAttribute('disabled')) event.preventDefault()
      //
      if (this.hasAttribute('scroll-to-top')) {
        const rootElement = document.documentElement
        rootElement.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
      //
      if (this.getAttribute('request-event-name')) {
        event.preventDefault()
        this.button.classList.toggle('active')
        this.button.setAttribute('aria-pressed', this.button.classList.contains('active')) // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed
        this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name'), {
          detail: this.getEventDetail(event),
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      }
    }
    this.answerEventListener = async event => {
      let tags = event.detail.tags
      if (this.getAttribute('active-detail-property-name')) {
        tags = await this.getAttribute('active-detail-property-name').split(':').reduce(async (accumulator, propertyName) => {
          // @ts-ignore
          propertyName = propertyName.replace(/-([a-z]{1})/g, (match, p1) => p1.toUpperCase())
          if (accumulator instanceof Promise) accumulator = await accumulator
          return accumulator[propertyName]
        }, event.detail)
      }
      if (tags) {
        const tagsIncludesTag = this.hasAttribute('tag-search')
          ? tags.some(tag => tag.includes(this.getAttribute('tag-search')))
          : tags.includes(this.getAttribute('tag'))
        this.button.classList[tagsIncludesTag ? 'add' : 'remove']('active')
      }
      this.button.setAttribute('aria-pressed', this.button.classList.contains('active')) // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed
    }
    // link behavior made accessible
    if (this.hasAttribute('href')) {
      this.setAttribute('data-href', this.getAttribute('href'))
      this.setAttribute('role', 'link')
    }
    // @ts-ignore
    if (this.textContent.length && this.textContent.trim().length) {
      // @ts-ignore
      this.labelText = this.textContent.trim() // allow its initial textContent to become the label if there are no nodes but only text
      this.textContent = ''
    }
    // request the href which results on a button click from the controller and if answered transfer this button into an a-node to have search engine robots follow the links
    // @ts-ignore
    this.wcConfigLoadListener = event => new Promise(resolve => this.dispatchEvent(new CustomEvent('request-href-' + this.getAttribute('request-event-name'), {
      detail: this.getEventDetail(null, false, resolve),
      bubbles: true,
      cancelable: true,
      composed: true
    }))).then(href => {
      if (href) {
        this.setAttribute('href', href)
        Promise.all([this.renderCSSPromise, this.renderHTMLPromise]).then(() => {
          // reset component to have a instead of button tag
          const oldAttributes = Array.from(this.button.attributes)
          this.disconnectedCallback()
          this.root.innerHTML = this.origInnerHTML
          this.connectedCallback()
          oldAttributes.forEach(attribute => this.button.setAttribute(attribute.name, attribute.value))
        })
      }
    })
  }

  connectedCallback () {
    super.connectedCallback()
    this.buttonTagName = this.hasAttribute('href') ? 'a' : 'button'
    if (this.shouldRenderCSS()) this.renderCSSPromise = this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTMLPromise = this.renderHTML()
    this.button.addEventListener('click', this.clickListener)
    if (this.getAttribute('answer-event-name')) document.body.addEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
    this.attributeChangedCallback('disabled')
    this.connectedCallbackOnce()
  }

  connectedCallbackOnce () {
    if (document.body.hasAttribute('wc-config-load')) {
      this.wcConfigLoadListener()
    } else {
      document.body.addEventListener(this.getAttribute('wc-config-load') || 'wc-config-load', this.wcConfigLoadListener, { once: true })
    }
    this.connectedCallbackOnce = () => {}
  }

  disconnectedCallback () {
    this.button.removeEventListener('click', this.clickListener)
    if (this.getAttribute('answer-event-name')) document.body.removeEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
  }

  // @ts-ignore
  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'label') {
      this.labelText = newValue
      if (this.label) {
        this.label.textContent = this.labelText || ''
        this.label.classList[this.labelText ? 'remove' : 'add']('hide')
      }
    } else if (this.button && name === 'disabled') {
      this.hasAttribute('disabled') ? this.button.setAttribute('disabled', '') : this.button.removeAttribute('disabled')
      this.hasAttribute('aria-disabled') ? this.button.setAttribute('aria-disabled', 'true') : this.button.removeAttribute('aria-disabled')
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector('style[_css]')
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.button || !this.label
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        cursor: unset !important;
        display: inline-block;
      }
      ${this.buttonTagName} {
        align-items: center;
        background-color: var(--background-color, transparent);
        border-radius: var(--border-radius, 0.5em);
        border: var(--border-width, 0px) solid var(--border-color, transparent);
        color: var(--color, black);
        cursor: pointer;
        display: flex;
        font-family: var(--font-family, unset);
        font-size: var(--font-size, 1em);
        font-weight: var(--font-weight, 400);
        justify-content: var(--justify-content, center);
        letter-spacing: var(--letter-spacing, normal);
        line-height: var(--line-height, 1.5em);
        margin: var(--margin, auto);
        opacity: var(--opacity, 1);
        outline: var(--outline, none);
        overflow: hidden;
        padding: var(--padding, calc(0.75em - var(--border-width, 0px)) calc(1.5em - var(--border-width, 0px)));
        text-decoration: var(--text-decoration, none);
        text-transform: var(--text-transform, none);
        touch-action: manipulation;
        transition: var(--transition, background-color 0.3s ease-out, border-color 0.3s ease-out, color 0.3s ease-out);
        width: var(--width, auto);
      }
      :host a {
        box-sizing: border-box;
        width: var(--width, fit-content);
      }
      ${this.buttonTagName}:hover, :host(.hover) ${this.buttonTagName} {
        background-color: var(--background-color-hover, var(--background-color, #B24800));
        border: var(--border-width-hover, var(--border-width, 0px)) solid var(--border-color-hover, var(--border-color, #FFFFFF));
        color: var(--color-hover, var(--color, #FFFFFF));
        opacity: var(--opacity-hover, var(--opacity, 1));
        font-weight: var(--font-weight-hover, var(--font-weight, 400));
        text-decoration: var(--text-decoration-hover, var(--text-decoration, none));
      }
      :host ${this.buttonTagName}.active {
        background-color: var(--background-color-active, var(--background-color-hover, var(--background-color, #803300)));
        color: var(--color-active, var(--color-hover, var(--color, #FFFFFF)));
      }
      ${this.buttonTagName} .arrow-right, :host ${this.buttonTagName} .arrow-right {
        display: inline-block;
      }
      :host ${this.buttonTagName}.active .arrow-right {
        display: none;
      }
      ${this.buttonTagName} .arrow-bottom, :host ${this.buttonTagName} .arrow-bottom {
        display: none;
      }
      :host ${this.buttonTagName}.active .arrow-bottom {
        display: inline-block;
      }
      :host ${this.buttonTagName}[disabled] {
        border: var(--border-width-disabled, var(--border-width, 0px)) solid var(--border-color-disabled, var(--border-color, #FFFFFF));
        background-color: var(--background-color-disabled, var(--background-color, #FFDAC2));
        color: var(--color-disabled, var(--color, #FFFFFF));
        cursor: not-allowed;
        opacity: var(--opacity-disabled, var(--opacity, 1));
        transition: opacity 0.3s ease-out;
      }
      :host ${this.buttonTagName}[disabled]:hover, :host(.hover) ${this.buttonTagName}[disabled] {
        opacity: var(--opacity-disabled-hover, var(--opacity-disabled, var(--opacity, 1)));
      }
      #label {
        display: inline-block;
        padding:var(--label-padding, 0);
        position: relative;
        text-align: var(--label-text-align, center);
      }
      #label.hide {
        display: none;
      }
      .icon-left {
        margin: var(--icon-left-margin, 0 0.5em 0 0);
      }
      .icon-right {
        margin: var(--icon-right-margin, 0 0 0 0.5em);
      }
      .icon-left, .icon-right {
        height: var(--icon-height, 1.5em);
        width: var(--icon-width, auto);
      }
      .icon-left, .icon-right {
        flex-shrink: 0;
      }
      @media only screen and (max-width: _max-width_) {
        ${this.buttonTagName} {
          font-size: var(--font-size-mobile, var(--font-size, 1em));
          margin: var(--margin-mobile, var(--margin, auto));
          border-radius: var(--border-radius-mobile, var(--border-radius, 0.571em));
        }
        ${this.buttonTagName}:hover, :host(.hover) ${this.buttonTagName} {
          background-color: var(--background-color-hover-mobile, var(--background-color-hover, var(--background-color, #B24800)));
          color: var(--color-hover-mobile, var(--color-hover, var(--color, #FFFFFF)));
        }
        ${this.buttonTagName}:active, ${this.buttonTagName}.active {
          background-color: var(--background-color-active-mobile, var(--background-color-active, var(--background-color-hover, var(--background-color, #803300))));
          color: var(--color-active-mobile, var(--color-active, var(--color-hover, var(--color, #FFFFFF))));
        }
        .icon-left {
          margin: var(--icon-left-margin-mobile, var(--icon-left-margin, 0 0.5em 0 0));
        }
        .icon-right {
          margin: var(--icon-right-margin-mobile, var(--icon-right-margin, 0 0 0 0.5em));
        }
        .icon-left, .icon-right {
          height: var(--icon-height-mobile,var(--icon-height, 1.5em));
          width: var(--icon-width-mobile, var(--icon-width, auto));
        }
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    const replaces = this.buttonTagName === 'a'
      ? [{
          pattern: '([^-]{1})button',
          flags: 'g',
          replacement: '$1a'
        }]
      : []
    switch (this.getAttribute('namespace')) {
      case 'button-primary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./primary-/primary-.css`,
          namespace: false,
          replaces
        }])
      case 'button-secondary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./secondary-/secondary-.css`,
          namespace: false,
          replaces
        }])
      case 'button-tertiary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./tertiary-/tertiary-.css`,
          namespace: false,
          replaces
        }])
      case 'button-quaternary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./quaternary-/quaternary-.css`,
          namespace: false,
          replaces
        }])
      case 'button-download-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./download-/download-.css`,
          namespace: false,
          replaces
        }])
      case 'button-category-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./primary-/primary-.css`,
          namespace: false,
          replaces: replaces.concat([{
            pattern: '--button-primary-',
            flags: 'g',
            replacement: '--button-category-'
          }])
        },
        {
          // @ts-ignore
          path: `${this.importMetaUrl}./category-/category-.css`,
          namespace: false,
          replaces
        }])
      case 'button-square-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./square-/square-.css`,
          namespace: false,
          replaces
        }])
      default:
        return Promise.resolve()
    }
  }

  /**
    * renders the html
    *
    * @return {Promise<void>}
    */
  renderHTML () {
    const { buttonTagName, labelText, downloadIcon } = this

    const hrefAttr = buttonTagName === 'a' ? `href="${this.getAttribute('href')}" target="${this.getAttribute('target') || '_self'}" ${this.hasAttribute('rel') ? `rel="${this.getAttribute('rel')}"` : ''}` : ''
    const typeAttr = `type="${this.getAttribute('type') || 'button'}"`
    const labelSpan = `<span id="label"${!labelText ? ' class="hide"' : ''}>${labelText || ''}</span>`

    this.html = /* html */`
      <${buttonTagName} ${hrefAttr} ${typeAttr}>${labelSpan}</${buttonTagName}>
    `

    if (this.getAttribute('namespace') === 'button-download-') {
      this.button.prepend(downloadIcon)
    }

    const iconLeft = this.root.querySelector('.icon-left')
    const iconRight = this.root.querySelector('.icon-right')
    const iconBottom = this.root.querySelector('.icon-bottom')

    if (iconLeft) this.button.prepend(iconLeft)
    if (iconRight) this.button.append(iconRight)
    if (iconBottom) this.button.append(iconBottom)

    return Promise.resolve()
  }

  /**
   * @param {Event | null} event
   * @param {boolean} [pushHistory=undefined]
   * @param {(value: any)=>void} [resolve=undefined]
   * @return {{origEvent: Event | null, tags: [string], isActive: boolean, fetchSubTags: boolean, clearSubTags: boolean, this: Button, textContent: string, pushHistory?: boolean, resolve?: (value: any)=>void}}
   */
  getEventDetail (event, pushHistory, resolve) {
    return {
      origEvent: event,
      tags: [this.getAttribute('tag')],
      isActive: this.button.classList.contains('active'),
      fetchSubTags: this.hasAttribute('fetch-sub-tags'),
      clearSubTags: this.hasAttribute('clear-sub-tags'),
      this: this,
      textContent: this.label.textContent,
      pushHistory,
      resolve
    }
  }

  get button () {
    return this.root.querySelector(this.buttonTagName)
  }

  get label () {
    return this.root.querySelector('#label')
  }

  get downloadIcon () {
    let iconImg
    iconImg = document.createElement('div')
    iconImg.innerHTML = /* html */ `
      <svg class="icon-left" width="60px" height="60px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <!-- Generator: Sketch 63.1 (92452) - https://sketch.com -->
        <title>Button Download</title>
        <desc>Created with Sketch.</desc>
        <g id="Button-Download" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Group-2">
                <circle id="Oval" fill="var(--button-download-background-color)" cx="30" cy="30" r="30"></circle>
                <g id="Group" transform="translate(19.000000, 14.000000)" stroke="var(--button-download-icon-color)" stroke-width="3">
                    <line x1="0" y1="30.5" x2="23" y2="30.5" id="Line-3" stroke-linecap="square"></line>
                    <line x1="11.5" y1="22" x2="11.5" y2="-6.10622664e-16" id="Line-3-Copy" stroke-linecap="square"></line>
                    <polyline id="Path-2" points="0 12.5 11.5 24.5 23 12.5"></polyline>
                </g>
            </g>
        </g>
      </svg>`
    return (iconImg = iconImg.children[0])
  }
}
