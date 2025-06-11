import { Component, Element, Event, EventEmitter, h, Host, Prop, State, Watch } from '@stencil/core';

/**
 * Constants for CSS class management
 */
const CONSTANTS = {
  DEFAULT_WIDTH: '500px',
  DEFAULT_HEIGHT: '300px',
  MIN_WIDTH: 300,
  MIN_HEIGHT: 200,
  PADDING_WIDTH: 40,
  PADDING_HEIGHT: 60,
  FOOTER_HEIGHT: 60, // Height reserved for footer section
};

/**
 * SVG markup for the resize indicator
 */
const RESIZE_INDICATOR_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L2 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 8L8 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 14L14 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  </svg>
`;

/**
 * Type definition for component states
 */
type CollapsibleState = 'expanded' | 'collapsed';

@Component({
  tag: 'pid-collapsible',
  styleUrl: 'collapsible.css',
  shadow: false,
})
export class PidCollapsible {
  @Element() el: HTMLElement;

  /**
   * Whether the collapsible is open by default
   */
  @Prop() open: boolean = false;

  /**
   * Whether to emphasize the component with border and shadow
   */
  @Prop() emphasize: boolean = false;

  /**
   * Whether the component is in expanded mode (full size)
   */
  @Prop({ mutable: true }) expanded: boolean = false;

  /**
   * Initial width when expanded
   */
  @Prop() initialWidth?: string;

  /**
   * Initial height when expanded
   */
  @Prop() initialHeight?: string;

  /**
   * Line height for collapsed state
   */
  @Prop() lineHeight: number = 24;

  /**
   * Whether to show the footer section
   */
  @Prop() showFooter: boolean = false;

  /**
   * Event emitted when the collapsible is toggled
   */
  @Event() collapsibleToggle: EventEmitter<boolean>;

  /**
   * Internal state to track current dimensions
   */
  @State() currentWidth: string;
  @State() currentHeight: string;

  // ResizeObserver to track resize events
  private resizeObserver: ResizeObserver;

  // Flag to prevent recursive toggle calls
  private isToggling = false;

  /**
   * Watch for changes in the open property
   */
  @Watch('open')
  watchOpen() {
    this.expanded = this.open;
    this.updateAppearance();
  }

  /**
   * Watch for changes in the expanded property
   */
  @Watch('expanded')
  watchExpanded() {
    this.updateAppearance();
  }

  componentWillLoad() {
    // Initialize state from props
    this.expanded = this.open;
    this.currentWidth = this.initialWidth || CONSTANTS.DEFAULT_WIDTH;
    this.currentHeight = this.initialHeight || CONSTANTS.DEFAULT_HEIGHT;
  }

  componentDidLoad() {
    this.setupResizeObserver();
    this.updateAppearance();
    this.addBrowserCompatibilityListeners();
  }

  disconnectedCallback() {
    this.cleanupResources();
  }

  /**
   * Sets up the resize observer to track dimension changes
   */
  private setupResizeObserver() {
    // Clean up existing observer if present
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Create new observer
    this.resizeObserver = new ResizeObserver(entries => {
      // Only track dimensions when expanded
      if (!this.expanded) return;

      for (const entry of entries) {
        // Update current dimensions based on observed changes
        this.currentWidth = `${entry.contentRect.width}px`;
        this.currentHeight = `${entry.contentRect.height}px`;
      }
    });

    // Start observing if expanded
    if (this.expanded) {
      this.resizeObserver.observe(this.el);
    }
  }

  /**
   * Adds event listeners for cross-browser compatibility
   */
  private addBrowserCompatibilityListeners() {
    const details = this.el.querySelector('details');
    if (!details) return;

    const summary = details.querySelector('summary');
    if (!summary) return;

    // Safari has issues with the details element
    summary.addEventListener('click', this.handleSafariCompatibility, { capture: true });
  }

  /**
   * Handles Safari-specific compatibility issues
   */
  private handleSafariCompatibility = (e: Event) => {
    // Only apply for Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!isSafari || this.isToggling) return;

    this.isToggling = true;
    e.preventDefault();
    e.stopPropagation();

    // Manually handle the toggle
    this.toggleCollapsible(e);

    // Reset toggle flag after short delay
    setTimeout(() => {
      this.isToggling = false;
    }, 100);
  };

  /**
   * Cleans up resources when component is destroyed
   */
  private cleanupResources() {
    // Disconnect ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Remove event listeners
    const details = this.el.querySelector('details');
    if (details) {
      const summary = details.querySelector('summary');
      if (summary) {
        summary.removeEventListener('click', this.handleSafariCompatibility, { capture: true });
      }
    }
  }

  /**
   * Updates the component appearance based on expanded state
   */
  private updateAppearance() {
    // Reset all classes and styles before applying new ones
    this.resetStyles();

    if (this.expanded) {
      this.applyExpandedStyles();
    } else {
      this.applyCollapsedStyles();
    }
  }

  /**
   * Resets all dynamically applied styles and classes
   */
  private resetStyles() {
    // Reset classes that might change between states
    this.el.classList.remove('resize-both', 'overflow-auto', 'w-auto', 'inline-block', 'align-middle', 'overflow-hidden', 'py-0', 'my-0');
  }

  /**
   * Applies styles for expanded state
   */
  private applyExpandedStyles() {
    // Apply expanded state classes
    this.el.classList.add('resize-both', 'overflow-auto', 'float-left', 'bg-white');

    // Calculate optimal dimensions based on content
    const dimensions = this.calculateContentDimensions();

    // Apply size constraints
    this.el.style.maxWidth = `${dimensions.maxWidth}px`;
    this.el.style.maxHeight = `${dimensions.maxHeight}px`;

    // Set dimensions
    this.updateDimensions(dimensions);

    // Enable resize and add visual indicator
    this.el.style.resize = 'both';
    this.addResizeIndicator();

    // Observe for resize events
    if (this.resizeObserver) {
      this.resizeObserver.observe(this.el);
    }
  }

  /**
   * Calculates content dimensions for optimal sizing
   */
  private calculateContentDimensions() {
    const contentElement = this.el.querySelector('.flex-grow');
    const contentWidth = contentElement?.scrollWidth || CONSTANTS.MIN_WIDTH;
    const contentHeight = contentElement?.scrollHeight || CONSTANTS.MIN_HEIGHT;

    // Add padding for better appearance, plus footer height if footer is shown
    const footerHeight = this.showFooter ? CONSTANTS.FOOTER_HEIGHT : 0;
    const maxWidth = contentWidth + CONSTANTS.PADDING_WIDTH;
    const maxHeight = contentHeight + CONSTANTS.PADDING_HEIGHT + footerHeight;

    return { contentWidth, contentHeight, maxWidth, maxHeight };
  }

  /**
   * Updates dimensions based on content and constraints
   */
  private updateDimensions(dimensions: { contentWidth: number; contentHeight: number; maxWidth: number; maxHeight: number }) {
    const { contentWidth, contentHeight, maxWidth, maxHeight } = dimensions;

    // Width handling
    if (!this.currentWidth || this.currentWidth === CONSTANTS.DEFAULT_WIDTH) {
      // Calculate optimal width
      this.currentWidth = `${Math.min(Math.max(contentWidth + CONSTANTS.PADDING_WIDTH, CONSTANTS.MIN_WIDTH), maxWidth)}px`;
    } else {
      // Ensure width doesn't exceed max
      const numericWidth = parseInt(this.currentWidth, 10);
      if (numericWidth > maxWidth) {
        this.currentWidth = `${maxWidth}px`;
      }
    }

    // Height handling
    if (!this.currentHeight || this.currentHeight === CONSTANTS.DEFAULT_HEIGHT) {
      // Calculate optimal height
      this.currentHeight = `${Math.min(Math.max(contentHeight + CONSTANTS.PADDING_HEIGHT, CONSTANTS.MIN_HEIGHT), maxHeight)}px`;
    } else {
      // Ensure height doesn't exceed max
      const numericHeight = parseInt(this.currentHeight, 10);
      if (numericHeight > maxHeight) {
        this.currentHeight = `${maxHeight}px`;
      }
    }

    // Apply dimensions
    this.el.style.width = this.currentWidth;
    this.el.style.height = this.currentHeight;
  }

  /**
   * Applies styles for collapsed state
   */
  private applyCollapsedStyles() {
    // Store current dimensions before collapsing
    if (this.el.style.width) {
      this.currentWidth = this.el.style.width;
    }
    if (this.el.style.height) {
      this.currentHeight = this.el.style.height;
    }

    // Clear size constraints
    this.el.style.maxWidth = '';
    this.el.style.maxHeight = '';

    // Auto width for collapsed state
    this.el.style.width = 'auto';

    // Apply collapsed state classes
    this.el.classList.add('w-auto', 'float-left', 'inline-block', 'align-middle', 'overflow-hidden', 'py-0', 'my-0');

    // Set line height for text
    this.el.style.height = `${this.lineHeight}px`;
    this.el.style.lineHeight = `${this.lineHeight}px`;

    // Disable resize
    this.el.style.resize = 'none';

    // Remove visual indicators
    this.removeResizeIndicator();

    // Stop resize observation
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.el);
    }
  }

  /**
   * Adds resize indicator to the component
   */
  private addResizeIndicator() {
    // Remove existing indicator first
    this.removeResizeIndicator();

    // Create and add new indicator
    const resizeIndicator = document.createElement('div');
    resizeIndicator.className = 'absolute bottom-0 right-0 w-4 h-4 opacity-100 pointer-events-none resize-indicator z-50';
    resizeIndicator.innerHTML = RESIZE_INDICATOR_SVG;
    this.el.appendChild(resizeIndicator);
  }

  /**
   * Removes resize indicator from the component
   */
  private removeResizeIndicator() {
    const resizeIndicator = this.el.querySelector('.resize-indicator');
    if (resizeIndicator) {
      resizeIndicator.remove();
    }
  }

  /**
   * Handles the toggle event
   */
  private handleToggle = (event: Event) => {
    if (this.isToggling) return;
    this.toggleCollapsible(event);
  };

  /**
   * Toggles the collapsible state
   */
  private toggleCollapsible(event: Event) {
    // Set flag to prevent recursive calls
    this.isToggling = true;

    // Stop event propagation
    event.stopPropagation();
    event.preventDefault();
    if (event.cancelable) {
      event.stopImmediatePropagation();
    }

    // Get details element
    const details = this.el.querySelector('details');
    if (!details) {
      this.isToggling = false;
      return;
    }

    // Toggle expanded state
    this.expanded = !this.expanded;
    details.open = this.expanded;

    // Emit event
    this.collapsibleToggle.emit(this.expanded);

    // Update appearance
    this.updateAppearance();

    // Ensure consistent state and reset flag
    setTimeout(() => {
      if (details.open !== this.expanded) {
        details.open = this.expanded;
      }
      setTimeout(() => {
        this.isToggling = false;
      }, 100);
    }, 0);
  }

  /**
   * Generates classes for different component states
   */
  private getClassesForState(state: CollapsibleState) {
    const baseClasses = ['relative', 'mx-2', 'float-left', 'bg-white', 'font-sans'];

    // Add emphasis classes if needed
    if (this.emphasize) {
      baseClasses.push('border', 'border-gray-300', 'rounded-md', 'shadow-sm');
    }

    // Add state-specific classes
    if (state === 'expanded') {
      baseClasses.push('mb-2', 'overflow-auto', 'max-w-full', 'resize-both', 'text-xs');
    } else {
      baseClasses.push('my-0', 'inline-block', 'align-middle', 'overflow-hidden', 'text-sm', `h-[${this.lineHeight}px]`, `leading-[${this.lineHeight}px]`);
    }

    return baseClasses.filter(Boolean).join(' ');
  }

  /**
   * Gets classes for the summary element
   */
  private getSummaryClasses() {
    const baseClasses = [
      'font-bold',
      'font-mono',
      'cursor-pointer',
      'list-none',
      'flex',
      'items-center',
      'focus:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-blue-400',
      'rounded-lg',
      'marker:hidden',
    ];

    // Add state-specific classes
    if (this.expanded) {
      baseClasses.push('sticky', 'top-0', 'bg-white', 'z-10', 'border-b', 'border-gray-100', 'p-1', 'overflow-visible');
    } else {
      baseClasses.push('px-0.5', 'py-0', 'whitespace-nowrap', 'text-ellipsis', 'overflow-hidden', `h-[${this.lineHeight}px]`, `leading-[${this.lineHeight}px]`);
    }

    return baseClasses.join(' ');
  }

  /**
   * Gets classes for the footer element
   */
  private getFooterClasses() {
    return [
      'sticky',
      'bottom-0',
      'bg-white',
      'border-t',
      'border-gray-100',
      'p-2',
      'flex',
      'items-center',
      'justify-between',
      'gap-2',
      'z-10',
      'min-h-[48px]',
      'flex-shrink-0',
    ].join(' ');
  }

  render() {
    // Get classes for current state
    const hostClasses = this.getClassesForState(this.expanded ? 'expanded' : 'collapsed');
    const summaryClasses = this.getSummaryClasses();
    const footerClasses = this.getFooterClasses();

    return (
      <Host class={hostClasses}>
        <details
          class="group w-full text-clip font-sans transition-all duration-200 ease-in-out flex flex-col h-full"
          open={this.open}
          onToggle={this.handleToggle}
          onClick={e => {
            e.stopPropagation();
            e.stopImmediatePropagation();
          }}
        >
          <summary
            class={summaryClasses}
            onClick={e => {
              e.stopPropagation();
              e.stopImmediatePropagation();
            }}
          >
            <span class={`inline-flex pr-1 items-center ${this.expanded ? 'flex-wrap overflow-visible' : 'flex-nowrap overflow-x-auto'}`}>
              {this.emphasize && (
                <span class="flex-shrink-0 pr-1">
                  <svg
                    class="transition group-open:-rotate-180"
                    fill="none"
                    height="12"
                    shape-rendering="geometricPrecision"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    viewBox="0 0 12 12"
                    width="10"
                    aria-hidden="true"
                  >
                    <path d="M 2 3 l 4 6 l 4 -6"></path>
                  </svg>
                </span>
              )}
              <slot name="summary"></slot>
            </span>
            <slot name="summary-actions"></slot>
          </summary>

          <div class={`flex-grow overflow-auto flex flex-col min-h-0 ${this.showFooter ? 'pb-0' : ''}`}>
            <slot></slot>
          </div>

          {this.showFooter && this.expanded && (
            <div class="flex flex-col w-full mt-auto sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200">
              {/* Main footer slot for pagination */}
              <slot name="footer"></slot>

              {/* Actions row */}
              <div class={footerClasses}>
                <div class="flex-grow">
                  <slot name="footer-left"></slot>
                </div>
                <div class="flex items-center gap-2">
                  <slot name="footer-actions"></slot>
                </div>
              </div>
            </div>
          )}
        </details>

        {this.expanded && (
          <div class="absolute bottom-0 right-0 w-4 h-4 opacity-100 pointer-events-none z-50 cursor-nwse-resize">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L2 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
              <path d="M22 8L8 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
              <path d="M22 14L14 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
        )}
      </Host>
    );
  }
}
