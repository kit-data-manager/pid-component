import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'pid-tooltip',
  shadow: false,
})
export class PidTooltip {
  /**
   * The text to display in the tooltip
   */
  @Prop() text!: string;

  /**
   * The position of the tooltip
   */
  @Prop() position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  /**
   * The maximum width of the tooltip
   */
  @Prop() maxWidth: string = '250px';

  /**
   * The maximum height of the tooltip
   */
  @Prop() maxHeight: string = '150px';

  render() {
    return (
      <Host class="relative inline-block w-full">
        <div class="flex items-center justify-between">
          <slot name="trigger"></slot>
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            class="icon icon-tabler icon-tabler-info-circle min-w-[1rem] min-h-[1rem] flex-shrink-0"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="#A0AEC0"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
            <polyline points="11 12 12 12 12 16 13 16" />
          </svg>
        </div>
        <div
          role="tooltip"
          class={`hidden z-20 absolute ${this.getPositionClasses()} mt-1 transition duration-100 ease-in-out shadow-md bg-white rounded text-xs text-gray-600 p-2 max-w-full w-full overflow-y-auto whitespace-normal border border-gray-200`}
          style={{
            maxWidth: this.maxWidth,
            maxHeight: this.maxHeight,
          }}
        >
          {this.text}
        </div>
      </Host>
    );
  }

  private getPositionClasses(): string {
    switch (this.position) {
      case 'top':
        return 'bottom-full left-0 mb-1';
      case 'bottom':
        return 'top-full left-0 mt-1';
      case 'left':
        return 'right-full top-0 mr-1';
      case 'right':
        return 'left-full top-0 ml-1';
      default:
        return 'top-full left-0 mt-1';
    }
  }
}
