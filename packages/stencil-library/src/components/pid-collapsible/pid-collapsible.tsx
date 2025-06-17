// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
 * Z-index scale for consistent layering
 */
const Z_INDICES = {
  RESIZE_HANDLE: 10,
  COPY_BUTTON: 20,
  FOOTER_CONTENT: 30,
  PAGINATION: 40,
  STICKY_ELEMENTS: 50,
};

/**
 * SVG markup for the resize indicator
 */
const RESIZE_INDICATOR_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L2 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 8L8 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 14L14 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
`;

/**
 * Component for creating collapsible/expandable content sections
 * with resize capability and cross-browser compatibility
 */
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
   * The dark mode setting for the component
   * Options: "light", "dark", "system"
   * Default: "system"
   */
  @Prop() darkMode: 'light' | 'dark' | 'system' = 'system';

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

  /**
   * Tracks the effective dark mode state (true for dark, false for light)
   */
  @State() isDarkMode: boolean = false;

  // Add these new private properties to store the last expanded dimensions
  private lastExpandedWidth: string;
  private lastExpandedHeight: string;

  // Media query for detecting system dark mode preference
  private darkModeMediaQuery: MediaQueryList;

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

  /**
   * Watch for changes in the darkMode property
   */
  @Watch('darkMode')
  watchDarkMode() {
    this.updateDarkMode();
  }

  componentWillLoad() {
    // Initialize state from props
    this.expanded = this.open;
    this.currentWidth = this.initialWidth || CONSTANTS.DEFAULT_WIDTH;
    this.currentHeight = this.initialHeight || CONSTANTS.DEFAULT_HEIGHT;

    // Initialize dark mode
    this.initializeDarkMode();
  }

  componentDidLoad() {
    this.setupResizeObserver();
    this.updateAppearance();
    this.addBrowserCompatibilityListeners();

    // Add clearfix for Safari - prevent text flow issues
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      this.el.style.display = 'inline-block';
      this.el.style.verticalAlign = 'top';

      // Create a clearfix element after the component
      const clearfix = document.createElement('div');
      clearfix.style.clear = 'both';
      clearfix.style.display = 'block';
      clearfix.style.height = '0';
      clearfix.style.visibility = 'hidden';
      clearfix.classList.add('pid-collapsible-clearfix');

      // Insert after the component
      if (this.el.parentNode) {
        this.el.parentNode.insertBefore(clearfix, this.el.nextSibling);
      }
    }
  }

  disconnectedCallback() {
    this.cleanupResources();

    // Remove any clearfix elements we created
    if (this.el.parentNode) {
      const clearfix = this.el.nextSibling;
      // Fix: Check if it's an HTMLElement and has our class
      if (clearfix instanceof HTMLElement && clearfix.classList.contains('pid-collapsible-clearfix')) {
        this.el.parentNode.removeChild(clearfix);
      }
    }

    // Clean up dark mode media query listener
    this.cleanupDarkModeListener();
  }

  /**
   * Initializes dark mode based on property and system preference
   */
  private initializeDarkMode() {
    // Check if the browser supports matchMedia
    if (window.matchMedia) {
      // Create media query for dark mode
      this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Set initial dark mode state
      this.updateDarkMode();

      // Add listener for system preference changes
      if (this.darkModeMediaQuery.addEventListener) {
        this.darkModeMediaQuery.addEventListener('change', this.handleDarkModeChange);
      } else if (this.darkModeMediaQuery.addListener) {
        // For older browsers
        this.darkModeMediaQuery.addListener(this.handleDarkModeChange);
      }
    } else {
      // Default to light mode if matchMedia is not supported
      this.isDarkMode = this.darkMode === 'dark';
    }
  }

  /**
   * Handles changes in system dark mode preference
   */
  private handleDarkModeChange = () => {
    this.updateDarkMode();
  };

  /**
   * Updates the dark mode state based on property and system preference
   */
  private updateDarkMode() {
    if (this.darkMode === 'dark') {
      this.isDarkMode = true;
    } else if (this.darkMode === 'light') {
      this.isDarkMode = false;
    } else if (this.darkMode === 'system' && this.darkModeMediaQuery) {
      this.isDarkMode = this.darkModeMediaQuery.matches;
    }
  }

  /**
   * Cleans up dark mode media query listener
   */
  private cleanupDarkModeListener() {
    if (this.darkModeMediaQuery) {
      if (this.darkModeMediaQuery.removeEventListener) {
        this.darkModeMediaQuery.removeEventListener('change', this.handleDarkModeChange);
      } else if (this.darkModeMediaQuery.removeListener) {
        // For older browsers
        this.darkModeMediaQuery.removeListener(this.handleDarkModeChange);
      }
    }
  }

  /**
   * Sets up the resize observer to track dimension changes
   */
  private setupResizeObserver() {
    // Check for ResizeObserver support
    if (!window.ResizeObserver) {
      console.warn('ResizeObserver not supported in this browser');
      return;
    }

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
   * Checks if the current browser is Safari
   */
  private isSafari(): boolean {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(navigator.userAgent);
  }

  /**
   * Handles Safari-specific compatibility issues
   */
  private handleSafariCompatibility = (e: Event) => {
    // Only apply for Safari
    if (!this.isSafari() || this.isToggling) return;

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
    // Remove all dynamic classes that might change between states
    const classesToRemove = ['resize-both', 'overflow-auto', 'w-auto', 'inline-block', 'align-middle', 'overflow-hidden', 'py-0', 'my-0', 'float-left', 'bg-white'];

    classesToRemove.forEach(cls => {
      if (this.el.classList.contains(cls)) {
        this.el.classList.remove(cls);
      }
    });

    // Reset inline styles
    this.el.style.width = '';
    this.el.style.height = '';
    this.el.style.maxWidth = '';
    this.el.style.maxHeight = '';
    this.el.style.resize = '';
    this.el.style.lineHeight = '';
  }

  /**
   * Applies styles for expanded state
   */
  private applyExpandedStyles() {
    try {
      // Apply Tailwind classes for expanded state
      this.el.classList.add('resize-both', 'overflow-auto', 'bg-white', 'relative', 'block');

      // Calculate optimal dimensions based on content
      const dimensions = this.calculateContentDimensions();

      // Apply size constraints
      this.el.style.maxWidth = `${dimensions.maxWidth}px`;
      this.el.style.maxHeight = `${dimensions.maxHeight}px`;

      // Set dimensions - use stored dimensions if available
      this.updateDimensions(dimensions);

      // Ensure we're not adding extra padding to the summary
      const summary = this.el.querySelector('summary');
      if (summary) {
        summary.style.height = `${this.lineHeight}px`;
        summary.style.minHeight = `${this.lineHeight}px`;
        summary.style.maxHeight = `${this.lineHeight}px`;
      }

      // Enable resize and add visual indicator
      this.el.style.resize = 'both';
      this.addResizeIndicator();

      // Observe for resize events
      if (this.resizeObserver) {
        this.resizeObserver.observe(this.el);
      }
    } catch (error) {
      console.error('Failed to apply expanded styles:', error);
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

    // Width handling - use last expanded width if available, otherwise calculate
    if (this.lastExpandedWidth && this.lastExpandedWidth !== CONSTANTS.DEFAULT_WIDTH) {
      this.currentWidth = this.lastExpandedWidth;
      // Ensure width doesn't exceed max
      const numericWidth = parseInt(this.currentWidth, 10);
      if (numericWidth > maxWidth) {
        this.currentWidth = `${maxWidth}px`;
      }
    } else if (!this.currentWidth || this.currentWidth === CONSTANTS.DEFAULT_WIDTH) {
      // Calculate optimal width
      this.currentWidth = `${Math.min(Math.max(contentWidth + CONSTANTS.PADDING_WIDTH, CONSTANTS.MIN_WIDTH), maxWidth)}px`;
    } else {
      // Ensure width doesn't exceed max
      const numericWidth = parseInt(this.currentWidth, 10);
      if (numericWidth > maxWidth) {
        this.currentWidth = `${maxWidth}px`;
      }
    }

    // Height handling - use last expanded height if available, otherwise calculate
    if (this.lastExpandedHeight && this.lastExpandedHeight !== CONSTANTS.DEFAULT_HEIGHT) {
      this.currentHeight = this.lastExpandedHeight;
      // Ensure height doesn't exceed max
      const numericHeight = parseInt(this.currentHeight, 10);
      if (numericHeight > maxHeight) {
        this.currentHeight = `${maxHeight}px`;
      }
    } else if (!this.currentHeight || this.currentHeight === CONSTANTS.DEFAULT_HEIGHT) {
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
    // Store current expanded dimensions for restoration
    if (this.el.style.width && this.el.style.width !== 'auto') {
      this.lastExpandedWidth = this.el.style.width;
      this.currentWidth = this.el.style.width;
    }
    if (this.el.style.height && this.el.style.height !== `${this.lineHeight}px`) {
      this.lastExpandedHeight = this.el.style.height;
      this.currentHeight = this.el.style.height;
    }

    // Clear size constraints
    this.el.style.maxWidth = '';
    this.el.style.maxHeight = '';

    // Auto width for collapsed state
    this.el.style.width = 'auto';

    // Apply Tailwind classes for collapsed state (without background)
    this.el.classList.add('w-auto', 'inline-block', 'align-middle', 'overflow-hidden', 'py-0', 'my-0');

    // Set strict height and line height for text to ensure smooth text flow
    this.el.style.height = `${this.lineHeight}px`;
    this.el.style.lineHeight = `${this.lineHeight}px`;
    this.el.style.minHeight = `${this.lineHeight}px`;
    this.el.style.maxHeight = `${this.lineHeight}px`;

    // Ensure proper display in Safari
    if (this.isSafari()) {
      // Add a small bottom margin to prevent text flow issues in Safari
      this.el.style.marginBottom = '1px';
      this.el.style.verticalAlign = 'top';
    }

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
    try {
      // Remove existing indicator first
      this.removeResizeIndicator();

      // Create and add new indicator with Tailwind classes
      const resizeIndicator = document.createElement('div');
      resizeIndicator.className = `absolute bottom-0 right-0 w-4 h-4 opacity-60 pointer-events-none resize-indicator cursor-nwse-resize text-slate-400 z-${Z_INDICES.RESIZE_HANDLE}`;
      resizeIndicator.innerHTML = RESIZE_INDICATOR_SVG;
      resizeIndicator.setAttribute('aria-hidden', 'true');
      this.el.appendChild(resizeIndicator);
    } catch (error) {
      console.error('Failed to add resize indicator:', error);
    }
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
   * Gets host classes based on current state
   */
  private getHostClasses() {
    const baseClasses = ['relative', 'mx-2', 'font-sans', 'transition-all', 'duration-200', 'ease-in-out', 'box-border', 'leading-normal'];

    // Add emphasis classes
    if (this.emphasize) {
      if (this.isDarkMode) {
        baseClasses.push('border', 'border-gray-600', 'rounded-md', 'shadow-sm');
      } else {
        baseClasses.push('border', 'border-gray-300', 'rounded-md', 'shadow-sm');
      }
    }

    // Add state-specific classes
    if (this.expanded) {
      baseClasses.push('mb-2', 'max-w-full', 'text-xs', 'block');
    } else {
      baseClasses.push('my-0', 'text-sm', 'float-left');
    }

    // Add dark mode text color only (no background)
    if (this.isDarkMode) {
      baseClasses.push('text-white');
    }

    return baseClasses.join(' ');
  }

  /**
   * Gets classes for the details element
   */
  private getDetailsClasses() {
    const baseClasses = ['group', 'w-full', 'font-sans', 'transition-all', 'duration-200', 'ease-in-out', 'flex', 'flex-col'];

    if (this.expanded) {
      baseClasses.push('h-full', 'overflow-visible');
    } else {
      baseClasses.push('text-clip', 'overflow-hidden');
    }

    // Add dark mode classes
    if (this.isDarkMode) {
      baseClasses.push('bg-gray-800', 'text-white');
    }

    return baseClasses.join(' ');
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
      'focus-visible:ring-offset-1',
      'rounded-lg',
      'marker:hidden',
      '[&::-webkit-details-marker]:hidden',
      'select-none',
      'box-border',
    ];

    if (this.expanded) {
      if (this.isDarkMode) {
        baseClasses.push('sticky', 'top-0', 'bg-gray-800', `z-${Z_INDICES.STICKY_ELEMENTS}`, 'border-b', 'border-gray-700', 'px-2', 'py-0', 'overflow-visible', 'backdrop-blur-sm');
      } else {
        baseClasses.push('sticky', 'top-0', 'bg-white', `z-${Z_INDICES.STICKY_ELEMENTS}`, 'border-b', 'border-gray-100', 'px-2', 'py-0', 'overflow-visible', 'backdrop-blur-sm');
      }
    } else {
      baseClasses.push('px-1', 'py-0', 'whitespace-nowrap', 'overflow-hidden', 'text-ellipsis', 'max-w-full');
    }

    // Apply consistent height for both states
    baseClasses.push(`h-[${this.lineHeight}px]`);

    return baseClasses.join(' ');
  }

  /**
   * Gets classes for the content area
   */
  private getContentClasses() {
    const baseClasses = ['flex-grow', 'flex', 'flex-col', 'min-h-0'];

    if (this.expanded) {
      baseClasses.push('overflow-auto', 'p-2');
    } else {
      baseClasses.push('overflow-hidden', 'p-0');
    }

    // Add dark mode classes
    if (this.isDarkMode) {
      baseClasses.push('bg-gray-800', 'text-white');
    }

    return baseClasses.join(' ');
  }

  /**
   * Gets classes for the footer container
   */
  private getFooterClasses() {
    const baseClasses = ['flex', 'flex-col', 'w-full', 'mt-auto', 'sticky', 'bottom-0', 'left-0', 'right-0', 'border-t', `z-${Z_INDICES.FOOTER_CONTENT}`, 'backdrop-blur-sm'];

    // Add dark mode classes
    if (this.isDarkMode) {
      baseClasses.push('bg-gray-800', 'border-gray-700');
    } else {
      baseClasses.push('bg-white', 'border-gray-200');
    }

    return baseClasses.join(' ');
  }

  /**
   * Gets classes for footer actions
   */
  private getFooterActionsClasses() {
    const baseClasses = ['flex', 'items-center', 'justify-between', 'gap-2', 'p-2', 'min-h-[3rem]', 'flex-shrink-0'];

    // Add dark mode classes
    if (this.isDarkMode) {
      baseClasses.push('bg-gray-800');
    } else {
      baseClasses.push('bg-white');
    }

    return baseClasses.join(' ');
  }

  render() {
    const hostClasses = this.getHostClasses();
    const detailsClasses = this.getDetailsClasses();
    const summaryClasses = this.getSummaryClasses();
    const contentClasses = this.getContentClasses();
    const footerClasses = this.getFooterClasses();
    const footerActionsClasses = this.getFooterActionsClasses();

    return (
      <Host class={hostClasses}>
        <details
          class={detailsClasses}
          open={this.open}
          onToggle={this.handleToggle}
          onClick={e => {
            e.stopPropagation();
            e.stopImmediatePropagation();
          }}
        >
          <summary
            class={summaryClasses}
            style={{ lineHeight: `${this.lineHeight}px`, height: `${this.lineHeight}px` }}
            onClick={e => {
              e.stopPropagation();
              e.stopImmediatePropagation();
            }}
          >
            <span class={`inline-flex h-full items-center gap-1 pr-2 ${this.expanded ? 'flex-nowrap whitespace-nowrap' : 'min-w-0 flex-nowrap overflow-hidden'}`}>
              {this.emphasize && (
                <span class="flex h-full flex-shrink-0 items-center">
                  <svg
                    class={`${this.isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-transform duration-200 group-open:rotate-180`}
                    fill="none"
                    height="12"
                    width="12"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                  >
                    <path d="M 2 3 l 4 6 l 4 -6"></path>
                  </svg>
                </span>
              )}
              <span class={`${this.expanded ? 'overflow-visible' : 'min-w-0 truncate'} flex h-full items-center`}>
                <slot name="summary"></slot>
              </span>
            </span>
            <div class="ml-auto flex h-full flex-shrink-0 items-center">
              <slot name="summary-actions"></slot>
            </div>
          </summary>

          <div class={`${contentClasses} ${this.expanded ? 'mt-[8px]' : ''}`}>
            <slot></slot>
          </div>

          {this.showFooter && this.expanded && (
            <div class={footerClasses}>
              {/* Main footer slot for pagination */}
              <div class={`z-50 overflow-visible border-b ${this.isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                <slot name="footer"></slot>
              </div>

              {/* Actions row */}
              <div class={footerActionsClasses}>
                <div class="flex-grow overflow-visible">
                  <slot name="footer-left"></slot>
                </div>
                <div class="flex flex-shrink-0 items-center gap-2 overflow-visible">
                  <slot name="footer-actions"></slot>
                </div>
              </div>
            </div>
          )}
        </details>
      </Host>
    );
  }
}
