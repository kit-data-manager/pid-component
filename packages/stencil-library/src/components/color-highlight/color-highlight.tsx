// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, h, Host, Prop, State } from '@stencil/core';
import { HSLColor } from './HSLColor';

@Component({
  tag: 'color-highlight',
  styleUrl: 'color-highlight.css',
  shadow: false,
})
export class ColorHighlight {
  /**
   * The text to highlight.
   * @type {string}
   */
  @Prop() text!: string;

  /**
   * The color of the text.
   * @private
   * @type {HSLColor}
   */
  @State() color: HSLColor;

  async componentWillLoad() {
    this.color = await HSLColor.generateColor(this.text);
  }

  render() {
    return (
      <Host>
        <span
          style={{
            color: 'hsl(' + this.color.hue + ',' + this.color.sat + '%,' + this.color.lum + '%)',
          }}
          class={`m-0 inline-block p-0 align-baseline font-mono leading-none font-bold`}
        >
          {this.text}
        </span>
      </Host>
    );
  }
}
