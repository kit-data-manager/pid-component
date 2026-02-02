// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, Element, Event, EventEmitter, h, Host, Listen, Prop, State } from '@stencil/core';

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
   * Internal state to track the calculated optimal position (top or bottom only)
   */
  @State() calculatedPosition: 'top' | 'bottom' = 'top';

  /**
   * Internal state to track if we need to expand the row
   */
  @State() needsRowExpansion: boolean = false;

  /**
   * Unique ID for ARIA attributes
   */
  private tooltipId: string = `tooltip-${Math.random().toString(36).substring(2, 11)}`;

  /**
   * Reference to the tooltip button for focus management
   */
  private buttonRef?: HTMLButtonElement;

  /**
   * Reference to the tooltip element for positioning calculations
   */
  private tooltipRef?: HTMLElement;

  /**
   * Reference to the table row for height manipulation
   */
  private tableRow?: HTMLTableRowElement;

  /**
   * Original row height before expansion
   */
  private originalRowHeight?: string;

  /**
   * Event emitted when tooltip requires row expansion
   */
  @Event() tooltipExpansionChange: EventEmitter<{ expand: boolean; requiredHeight: number }>;

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
   * Shows the tooltip and calculates optimal position
   */
  private showTooltip = () => {
    this.isVisible = true;
    // Calculate position after the tooltip becomes visible
    setTimeout(() => this.calculateOptimalPosition(), 10);
  };

  /**
   * Hides the tooltip and restores row height
   */
  private hideTooltip = () => {
    this.isVisible = false;
    this.restoreRowHeight();
  };

  /**
   * Toggles tooltip visibility on button click
   */
  private toggleTooltip = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.isVisible) {
      this.hideTooltip();
    } else {
      this.showTooltip();
    }
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
   * The preferred position of the tooltip (top or bottom)
   */
  @Prop() position: 'top' | 'bottom' = 'top';

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
    // Set initial calculated position
    this.calculatedPosition = this.position === 'bottom' ? 'bottom' : 'top';
    // Find the table row for potential height manipulation
    this.tableRow = this.el.closest('tr') as HTMLTableRowElement;
  }

  /**
   * Calculate the optimal position (top or bottom) and determine if row expansion is needed
   */
  private calculateOptimalPosition() {
    if (!this.tooltipRef || !this.isVisible) return;

    const hostRect = this.el.getBoundingClientRect();
    const table = this.el.closest('table');
    const tableContainer = table?.closest('.overflow-auto') || table?.parentElement;

    if (!tableContainer) {
      // Fallback to original position if not in a table
      this.calculatedPosition = this.position === 'bottom' ? 'bottom' : 'top';
      return;
    }

    const containerRect = tableContainer.getBoundingClientRect();

    // Calculate available space above and below
    const spaceAbove = hostRect.top - containerRect.top;
    const spaceBelow = containerRect.bottom - hostRect.bottom;

    // Get tooltip content height
    const tooltipHeight = this.estimateTooltipHeight(this.text);
    const requiredSpace = tooltipHeight + 20; // Add margin

    // Determine position based on available space
    let useBottom: boolean;
    let needsExpansion = false;

    if (this.position === 'top' && spaceAbove >= requiredSpace) {
      // Preferred top position fits
      useBottom = false;
    } else if (this.position === 'bottom' && spaceBelow >= requiredSpace) {
      // Preferred bottom position fits
      useBottom = true;
    } else if (spaceAbove >= spaceBelow && spaceAbove >= requiredSpace) {
      // More space above and it fits
      useBottom = false;
    } else if (spaceBelow >= requiredSpace) {
      // Bottom has enough space
      useBottom = true;
    } else {
      // Neither position has enough space - use bottom and expand row
      useBottom = true;
      needsExpansion = true;
    }

    this.calculatedPosition = useBottom ? 'bottom' : 'top';
    this.needsRowExpansion = needsExpansion;

    if (needsExpansion) {
      this.expandRowForTooltip(tooltipHeight);
    }
  }

  /**
   * Expand the table row to accommodate the tooltip
   */
  private expandRowForTooltip(tooltipHeight: number) {
    if (!this.tableRow) return;

    // Store original height
    this.originalRowHeight = this.tableRow.style.height || 'auto';

    // Calculate required row height
    const currentRowHeight = this.tableRow.offsetHeight;
    const requiredAdditionalHeight = tooltipHeight + 40; // Extra padding for tooltip + margins
    const newRowHeight = Math.max(currentRowHeight, requiredAdditionalHeight);

    // Apply new height with smooth transition
    this.tableRow.style.transition = 'height 0.2s ease-in-out';
    this.tableRow.style.height = `${newRowHeight}px`;

    // Emit event for any parent components that need to know
    this.tooltipExpansionChange.emit({
      expand: true,
      requiredHeight: newRowHeight,
    });
  }

  /**
   * Restore the original row height
   */
  private restoreRowHeight() {
    if (!this.tableRow || !this.needsRowExpansion) return;

    // Restore original height
    this.tableRow.style.height = this.originalRowHeight || 'auto';

    // Remove transition after animation completes
    setTimeout(() => {
      if (this.tableRow) {
        this.tableRow.style.transition = '';
      }
    }, 200);

    this.needsRowExpansion = false;

    // Emit event for cleanup
    this.tooltipExpansionChange.emit({
      expand: false,
      requiredHeight: 0,
    });
  }

  /**
   * Estimate the height required for the tooltip content
   */
  private estimateTooltipHeight(content: string): number {
    // Create a temporary element to measure content height
    const tempDiv = document.createElement('div');

    // Add accessibility attributes to hide from screen readers and assistive tech
    tempDiv.setAttribute('aria-hidden', 'true');
    tempDiv.setAttribute('tabindex', '-1');
    tempDiv.setAttribute('role', 'presentation');

    tempDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: normal;
      word-wrap: break-word;
      max-width: ${this.maxWidth};
      padding: 12px;
      font-size: 12px;
      line-height: 1.4;
      border: 1px solid transparent;
      pointer-events: none;
    `;
    tempDiv.textContent = content;

    document.body.appendChild(tempDiv);
    const height = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);

    return height;
  }

  render() {
    // Don't show the tooltip icon if there's no text
    const hasTooltipText = this.text && this.text.trim().length > 0;

    // Determine appropriate button label based on visibility state
    const buttonLabel = `${this.isVisible ? 'Hide' : 'Show'} additional information`;

    // Check if dark mode is active by looking at the closest pid-component
    const parentComponent = this.el.closest('pid-component');
    const isDarkMode = parentComponent?.classList.contains('bg-gray-800');

    return (
      <Host class="relative inline-block w-full" onMouseEnter={this.showTooltip} onMouseLeave={this.hideTooltip}>
        {/* Screen reader announcement for tooltip state changes */}
        {this.isVisible && (
          <span class="sr-only" aria-live="assertive">
            Information tooltip opened
          </span>
        )}

        <div class="flex items-center justify-between">
          <slot name="trigger"></slot>
          {hasTooltipText && (
            <button
              ref={el => (this.buttonRef = el)}
              type="button"
              class={`flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              } focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-hidden`}
              aria-label={buttonLabel}
              aria-expanded={this.isVisible ? 'true' : 'false'}
              aria-controls={this.tooltipId}
              aria-describedby={this.isVisible ? this.tooltipId : undefined}
              onClick={this.toggleTooltip}
              onKeyDown={this.handleButtonKeyDown}
              onFocus={this.showTooltip}
              onBlur={this.hideTooltip}
              tabIndex={0}
              title={buttonLabel}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-info-circle min-h-4 min-w-4 shrink-0"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                role="img"
              >
                <title>Information icon</title>
                <desc>An icon indicating additional information is available</desc>
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
            ref={el => (this.tooltipRef = el)}
            id={this.tooltipId}
            role="tooltip"
            class={`${this.isVisible ? 'block' : 'hidden'} absolute z-50 ${this.getPositionClasses(this.calculatedPosition)} w-full rounded border ${
              isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-700'
            } p-3 text-xs whitespace-normal shadow-lg transition-opacity duration-200 ease-in-out`}
            style={this.getTooltipStyles()}
            aria-live="polite"
          >
            {/* Use paragraph for better semantics */}
            <p class="m-0 p-0">{this.text}</p>
          </div>
        )}
      </Host>
    );
  }

  private getPositionClasses(position: 'top' | 'bottom'): string {
    switch (position) {
      case 'top':
        return 'bottom-full left-0 mb-2';
      case 'bottom':
        return 'top-full left-0 mt-2';
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

    // Set appropriate height constraints
    if (this.needsRowExpansion || !this.fitContent) {
      styles.maxHeight = this.maxHeight;
      styles.overflowY = 'auto';
    }

    return styles;
  }
}
