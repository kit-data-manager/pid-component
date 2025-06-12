import { Component, Element, h, Host, Listen, Prop, State } from '@stencil/core';

@Component({
  tag: 'pid-tooltip',
  shadow: false,
})
export class PidTooltip {
  @Element() el!: HTMLElement;

  /**
   * Internal state to track if tooltip is visible
   */
  @State() isVisible: boolean = false;

  /**
   * Internal state to track if this tooltip is in the first row of a table
   */
  @State() isFirstRow: boolean = false;

  /**
   * Unique ID for ARIA attributes
   */
  private tooltipId: string = `tooltip-${Math.random().toString(36).substring(2, 11)}`;

  /**
   * Reference to the tooltip button for focus management
   */
  private buttonRef?: HTMLButtonElement;

  /**
   * Handle keyboard events for accessibility
   */
  @Listen('keydown')
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isVisible) {
      this.hideTooltip();
      // Return focus to the button when closing with Escape
      this.buttonRef?.focus();
      event.preventDefault();
      event.stopPropagation();
    }
  }

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
   * Toggles tooltip visibility on button click
   */
  private toggleTooltip = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    this.isVisible = !this.isVisible;
  };

  /**
   * Handle button keyboard events
   */
  private handleButtonKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleTooltip(event);
    }
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

  componentDidLoad() {
    // Check if this tooltip is in the first row of a data table
    this.checkIfInFirstTableRow();
  }

  /**
   * Check if tooltip is in the first row of a table
   */
  private checkIfInFirstTableRow() {
    const isInTable = !!this.el.closest('table');
    if (isInTable) {
      const tr = this.el.closest('tr');
      const tbody = tr?.parentElement;
      if (tbody && tbody.tagName.toLowerCase() === 'tbody') {
        const firstRow = tbody.querySelector('tr:first-child');
        this.isFirstRow = tr === firstRow;
      }
    }
  }

  render() {
    // Don't show the tooltip icon if there's no text
    const hasTooltipText = this.text && this.text.trim().length > 0;

    // If this is the first row in a table, force bottom position to prevent cut-off
    const effectivePosition = this.isFirstRow ? 'bottom' : this.position;

    return (
      <Host class="relative inline-block w-full" onMouseEnter={this.showTooltip} onMouseLeave={this.hideTooltip}>
        <div class="flex items-center justify-between">
          <slot name="trigger"></slot>
          {hasTooltipText && (
            <button
              ref={el => (this.buttonRef = el)}
              type="button"
              class="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full p-0.5 transition-colors duration-200 hover:bg-gray-100"
              aria-label={`${this.isVisible ? 'Hide' : 'Show'} additional information`}
              aria-expanded={this.isVisible ? 'true' : 'false'}
              aria-controls={this.tooltipId}
              aria-describedby={this.isVisible ? this.tooltipId : undefined}
              onClick={this.toggleTooltip}
              onKeyDown={this.handleButtonKeyDown}
              onFocus={this.showTooltip}
              onBlur={this.hideTooltip}
              tabIndex={0}
            >
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
            </button>
          )}
        </div>
        {hasTooltipText && (
          <div
            id={this.tooltipId}
            role="tooltip"
            class={`${this.isVisible ? 'block' : 'hidden'} z-50 absolute ${this.getPositionClasses(effectivePosition)} transition-opacity duration-200 ease-in-out shadow-lg bg-white rounded text-xs text-gray-700 p-3 w-full whitespace-normal border border-gray-300`}
            style={this.getTooltipStyles()}
            aria-live="polite"
          >
            {this.text}
          </div>
        )}
      </Host>
    );
  }

  private getPositionClasses(position: 'top' | 'bottom' | 'left' | 'right' = 'top'): string {
    switch (position) {
      case 'top':
        return 'bottom-full left-0 mb-2';
      case 'bottom':
        return 'top-full left-0 mt-2';
      case 'left':
        return 'right-full top-0 mr-2';
      case 'right':
        return 'left-full top-0 ml-2';
      default:
        return 'top-full left-0 mt-2';
    }
  }

  /**
   * Get the inline styles for the tooltip container
   */
  private getTooltipStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {
      maxWidth: this.maxWidth,
    };

    // Only add maxHeight if we're not fitting content exactly
    if (!this.fitContent) {
      styles.maxHeight = this.maxHeight;
      styles.overflowY = 'auto';
    }

    return styles;
  }
}
