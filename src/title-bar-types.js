import { LitElement, html, css } from 'lit-element';

export class TitleBarTypes extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      darkMode: { type: Boolean, reflect: true, attribute: 'dark-mode' },
      bar: { type: Object },
    };
  }

  constructor() {
    super();
    /**
     * The title to display inside the title bar
     * - should be less then 100 characters
     * - should not contain HTMl
     * - should be between 2-5 words
     *
     * @example
     * // DO:
     * el.title = 'Welcome to the jungle';
     *
     * // DON'T:
     * el.title = 'Info';
     * el.title = 'Welcome to <strong>the</strong> jungle';
     * el.title = 'We like to talk about more then just what sees the eye';
     */
    this.title = 'You are awesome';

    /**
     * If that is set colors will be switched
     */
    this.darkMode = false;

    /**
     * This is an visible bar that gets displayed at the appropriate coordinates.
     * It has a height of 100%. An optional title can be provided.
     *
     * @typedef {Object} Bar
     * @property {number} x The distance from the left
     * @property {number} y The distance from the top
     * @property {string} [title] Optional title that will set as an attribute (defaults to '')
     */

    /**
     * @type {Bar}
     */
    this.bar = { x: 0, y: 0, title: 'I am dot' };

    /**
     * You can provide a specific formatter that will change the way the title
     * get's displayed.
     *
     * *Note*: Changeing the formatter does NOT trigger a rerender.
     *
     * @example
     * el.formatter = (value) => `${value} for real!`;
     *
     * @type {Function}
     */
    this.formatter = null;
  }

  render() {
    // positioning the bar like this is just for illustration purposes => do not do this
    return html`
      <h1>${this.format(this.title, { prefix: '' })}</h1>
      <div
        class="dot"
        style=${`left: ${this.bar.x}px; top: ${this.bar.y}`}
        title=${this.bar.title ? this.bar.title : ''}
      ></div>
    `;
  }

  /**
   * This function can prefix/suffix your string.
   *
   * @example
   * el.format('foo', { prefix: '...' });
   *
   * @param {string|number} value String to format
   */
  format(value, { prefix, suffix = '' } = { prefix: '' }) {
    let formattedValue = value;
    if (this.formatter) {
      formattedValue = this.formatter(value);
    }
    return `${prefix}${formattedValue}${suffix}`;
  }

  static get styles() {
    return css`
      :host {
        margin: 50px;
        text-align: center;
        min-height: 100px;
        display: block;
        padding: 20px;
        background: #fff;
        color: #333;
        position: relative;
      }

      :host([dark-mode]) {
        background: #333;
        color: #fff;
      }

      .bar {
        background: red;
        width: 10px;
        height: 100%;
        position: absolute;
      }
    `;
  }
}

customElements.define('title-bar-types', TitleBarTypes);
