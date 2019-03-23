import { LitElement, html, css } from 'lit-element';

export class TitleBar extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      darkMode: { type: Boolean, reflect: true, attribute: 'dark-mode' },
      bar: { type: Object },
    };
  }

  constructor() {
    super();
    this.title = 'You are awesome';
    this.darkMode = false;
    this.bar = { x: 0, y: 0, title: 'I am dot' };
    this.formatter = null;
  }

  render() {
    // positioning the bar like this is just for illustration purposes => do not do this
    return html`
      <h1>${this.format(this.title)}</h1>
      <div
        class="dot"
        style=${`left: ${this.bar.x}px; top: ${this.bar.y}`}
        title=${this.bar.title}
      ></div>
    `;
  }

  format(value) {
    if (this.formatter) {
      return this.formatter(value);
    }
    return value;
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

customElements.define('title-bar', TitleBar);
