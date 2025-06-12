import { Component, h, Host, Prop, State } from '@stencil/core';

@Component({
  tag: 'pid-tooltip',
  shadow: false,
})
export class PidTooltip {
  /**
   * Internal state to track if tooltip is visible
   */
  @State() isVisible: boolean = false;

  /**
   * Shows the tooltip
   */
  private showTooltip = () => {
    this.isVisible = true;
  };

  /**
   * Hides the tooltip
   */
  private hideTooltip = () => {
    this.isVisible = false;
  };

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

  /**
   * Whether the tooltip should fit its content height exactly
   */
  @Prop() fitContent: boolean = true;

  render() {
    // Don't show the tooltip icon if there's no text
    const hasTooltipText = this.text && this.text.trim().length > 0;

    return (
      <Host class="relative inline-block w-full" onMouseEnter={this.showTooltip} onMouseLeave={this.hideTooltip} onFocus={this.showTooltip} onBlur={this.hideTooltip}>
        <div class="flex items-center justify-between">
          <slot name="trigger"></slot>
          {hasTooltipText && (
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
          )}
        </div>
        {hasTooltipText && (
          <div
            role="tooltip"
            class={`${this.isVisible ? '' : 'hidden'} z-20 absolute ${this.getPositionClasses()} mt-1 transition duration-100 ease-in-out shadow-md bg-white rounded text-xs text-gray-600 p-2 w-full whitespace-normal border border-gray-200`}
            style={{
              // We need to keep these as inline styles since they're dynamic values
              // Tailwind can't process dynamic values at runtime
              maxWidth: this.maxWidth,
              ...(this.fitContent ? {} : { maxHeight: this.maxHeight }),
            }}
          >
            {this.text}
          </div>
        )}
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
