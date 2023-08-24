import { Component, Host, h, Prop, State } from '@stencil/core';
import { PID } from '../../utils/PID';
import { HSLColor } from '../../utils/HSLColor';

/**
 * This component highlights a handle and links to the FAIR DO Scope.
 * It automatically generates colors for the parts of the handle (prefix and suffix) to make them easily distinguishable.
 */
@Component({
  tag: 'handle-highlight',
  styleUrl: 'handle-highlight.css',
  shadow: true,
})
export class HandleHighlight {
  /**
   The private state of the parts of the handle. Consists of the text, the color and a boolean whether a next part exists.
   */
  @State() parts: { text: string; color: HSLColor; nextExists: boolean }[] = [];

  /**
   * The private state where this component should link to.
   */
  @State() link: string = '';

  /**
   * The Handle to highlight and link in this component.
   */
  @Prop() handle!: string;

  /**
   * An optional custom link to use instead of the default one which links to the FAIR DO Scope.
   */
  @Prop() linkTo: 'disable' | 'fairdoscope' | 'resolveRef' = 'fairdoscope';

  /**
   * Whether the component should use the filled or the outlined design.
   */
  @Prop() filled: boolean = false;

  /**
   * This method is called when the component is first connected to the DOM.
   * It generates the colors for the parts of the handle and stores them in the state.
   * Since the generation of the colors is asynchronous, the parts are added to the state as soon as they are generated.
   */
  async connectedCallback() {
    // Parse the PID
    const pid = PID.getPIDFromString(this.handle);

    // Generate the colors for the parts of the PID
    this.parts = [
      {
        text: pid.prefix,
        color: await HSLColor.generateColor(pid.prefix),
        nextExists: true,
      },
      {
        text: pid.suffix,
        color: await HSLColor.generateColor(pid.suffix),
        nextExists: false,
      },
    ];

    if (this.linkTo === 'fairdoscope') this.link = `https://kit-data-manager.github.io/fairdoscope/?pid=${this.handle}`;
    else if (this.linkTo === 'resolveRef') this.link = `https://hdl.handle.net/${this.handle}#resolve`;
    else if (this.linkTo === 'disable') this.link = '';

    console.log(this.link);
    console.log(this.linkTo);
  }

  render() {
    return (
      <Host>
        <a
          href={this.link}
          onClick={el => {
            if (this.link === '' || this.linkTo === 'disable') el.preventDefault();
          }}
          target={'_blank'}
          rel={'noopener noreferrer'}
        >
          {this.filled ? (
            <span class={'inline p-0.5 bg-gray-100 shadow-sm rounded-md text-clip align-baseline leading-relaxed'}>
              {this.parts.map(element => {
                return (
                  <span>
                    <span
                      style={{
                        backgroundColor: 'hsl(' + element.color.hue + ',' + element.color.sat + '%,' + element.color.lum + '%)',
                      }}
                      class={`font-mono p-0.5 rounded-md ${element.color.lum > 50 ? 'text-gray-800' : 'text-gray-200'}`}
                    >
                      {element.text}
                    </span>
                    <span class={'font-mono text-gray-800'}>{element.nextExists ? '/' : ''}</span>
                  </span>
                );
              })}
            </span>
          ) : (
            <span class={'border bg-gray-100 rounded-md shadow-sm inline p-0.5 text-clip align-baseline leading-relaxed'}>
              {this.parts.map(element => {
                return (
                  <span>
                    <span
                      style={{
                        backgroundColor: 'hsl(' + element.color.hue + ',' + element.color.sat + '%,' + element.color.lum + '%)',
                      }}
                      class={`font-mono font-bold p-0.5 rounded-md text-transparent bg-clip-text`}
                    >
                      {element.text}
                    </span>
                    <span class={'font-bold text-gray-800'}>{element.nextExists ? '/' : ''}</span>
                  </span>
                );
              })}
            </span>
          )}
        </a>
      </Host>
    );
  }
}
