import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, State, Watch } from '@stencil/core';

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
   * Whether the collapsible is open
   * @description Controls whether the component is expanded (opened) or collapsed
   */
  @Prop({ mutable: true }) open: boolean = false;

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
   * Whether to apply floating/overlay styling when expanded.
   * When true, applies absolute positioning and z-index for overlay behavior.
   */
  @Prop() expanded: boolean = false;

  /**
   * Whether the preview should be scrollable (for subcomponents or expanded state).
   */
  @Prop() previewScrollable: boolean = false;

  /**
   * Event emitted when the collapsible is toggled
   */
  @Event() collapsibleToggle: EventEmitter<boolean>;

  /**
   * Event emitted when content dimensions need to be recalculated
   * Useful for pagination to ensure proper height
   */
  @Event() contentHeightChange: EventEmitter<{ maxHeight: number }>;

  /**
   * Internal state to track current dimensions
   */
  @State() currentWidth: string;
  @State() currentHeight: string;

  /**
   * Tracks the effective dark mode state (true for dark, false for light)
   */
  @State() isDarkMode: boolean = false;

  // Properties to store the last expanded dimensions for restoration when toggling
  private lastExpandedWidth: string;
  private lastExpandedHeight: string;

  // Media query for detecting system dark mode preference
  private darkModeMediaQuery: MediaQueryList;

  // ResizeObserver to track resize events
  private resizeObserver: ResizeObserver;

  // Flag to prevent recursive toggle calls
  private isToggling = false;
  private lastClickTime = 0;
  private pendingClickTimer: ReturnType<typeof setTimeout> | null = null;

  // Debounce timer for resize optimization
  private resizeDebounceTimer: number = null;

  // Last known resize dimensions
  private lastResizeDimensions = { width: 0, height: 0 };

  /**
   * Watch for changes in the open property
   */
  @Watch('open')
  watchOpen() {
    this.updateAppearance();

    // When open, ensure content dimensions are properly calculated
    if (this.open) this.recalculateContentDimensions();
  }

  /**
   * Watch for changes in the darkMode property
   */
  @Watch('darkMode')
  watchDarkMode() {
    this.updateDarkMode();
  }

  componentWillLoad() {
    // Default width if no initial width is provided
    this.currentWidth = this.initialWidth || CONSTANTS.DEFAULT_WIDTH;
    this.currentHeight = this.initialHeight || CONSTANTS.DEFAULT_HEIGHT;

    // Initialize dark mode
    this.initializeDarkMode();
  }

  componentDidLoad() {
    this.setupResizeObserver();
    this.updateAppearance();
    this.addBrowserCompatibilityListeners();
    this.addComponentEventListeners();

    // // When component is initially open, ensure dimensions are properly calculated after rendering
    // if (this.open) {
    //   // // Make sure expanded state is set correctly for open components
    //   // this.open = true;
    //
    //   // Use a small delay to ensure the DOM is fully rendered
    //   setTimeout(() => {
    //     // Force recalculation of dimensions for open components
    //     this.recalculateContentDimensions();
    //   }, 100);
    // }

    // Safari inline-block fix (no clearfix div — it would break text flow)
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      this.el.style.verticalAlign = 'top';
    }
  }

  disconnectedCallback() {
    this.cleanupResources();

    // Clean up dark mode media query listener
    this.cleanupDarkModeListener();
  }

  /**
   * Public method to recalculate content dimensions
   * Can be called externally, for example when pagination changes
   * Optimized for better performance
   */
  @Method()
  public async recalculateContentDimensions() {
    if (this.open) {
      // Use a small delay to avoid excessive recalculations
      if (this.resizeDebounceTimer !== null) {
        window.cancelAnimationFrame(this.resizeDebounceTimer);
      }

      return new Promise<{
        contentWidth: number;
        contentHeight: number;
        maxWidth: number;
        maxHeight: number
      }>(resolve => {
        this.resizeDebounceTimer = window.requestAnimationFrame(() => {
          // Width: use stored user-resized width, configured initial width, or responsive default
          if (this.lastExpandedWidth) {
            this.currentWidth = this.lastExpandedWidth;
          } else {
            this.currentWidth = this.initialWidth || this.getResponsiveDefaultWidth();
          }

          this.el.style.width = this.currentWidth;

          // Set height to auto to let content drive it, then measure
          this.el.style.height = 'auto';
          this.el.style.maxHeight = 'max-content';

          requestAnimationFrame(() => {
            // Capture the actual content height and set as concrete pixels
            // so resize:both works in Safari
            if (this.open) {
              const actualHeight = this.el.scrollHeight;
              this.el.style.height = `${actualHeight}px`;
              this.el.style.maxHeight = `${actualHeight}px`;
            }

            this.lastExpandedWidth = this.currentWidth;

            const dimensions = this.calculateContentDimensions();
            this.contentHeightChange.emit({ maxHeight: dimensions.maxHeight });
            this.resizeDebounceTimer = null;

            resolve(dimensions);
          });
        });
      });
    }
    return null;
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
        >
          <summary
            class={summaryClasses}
            onClick={this.handleSummaryClick}
          >
            {this.emphasize && (
              <span>
                  <svg
                    class={`${this.isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-transform duration-200 group-open:rotate-180 mr-2 ml-1`}
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
            <span
              class={`block ${this.previewScrollable ? 'shrink-0' : 'min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'}`}>
                <slot name="summary"></slot>
              </span>
            <div class={`ml-auto shrink-0 ${this.previewScrollable ? 'sticky right-0' : ''}`}>
              <slot name="summary-actions"></slot>
            </div>
          </summary>

          <div class={`${contentClasses}`}>
            <slot></slot>
          </div>

          {this.showFooter && this.open && (
            <div class={footerClasses}>
              {/* Main footer slot for pagination */}
              <div
                class={`z-50 overflow-visible border-b ${this.isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                <slot name="footer"></slot>
              </div>

              {/* Actions row */}
              <div class={footerActionsClasses}>
                <div class="grow overflow-visible">
                  <slot name="footer-left"></slot>
                </div>
                <div class="flex shrink-0 items-center gap-2 overflow-visible">
                  <slot name="footer-actions"></slot>
                </div>
              </div>
            </div>
          )}
        </details>
      </Host>
    );
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
   * Listens to page changes from pid-data-table and recalculates dimensions
   * @param event The page change event
   */
  private handlePageChange = (event: CustomEvent<number>) => {
    // When the page changes, recalculate dimensions after the DOM updates
    console.debug('Page changed to:', event.detail);
    this.recalculateContentDimensions();
  };

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

    // Create new observer with debouncing for better performance
    this.resizeObserver = new ResizeObserver(entries => {
      // Only track dimensions when expanded
      if (!this.open) return;

      // Get the entry from the first parameter
      const entry = entries[0];
      if (!entry) return;

      const width = entry.contentRect.width;
      const height = entry.contentRect.height;

      // Skip if dimensions haven't changed significantly (avoid needless updates)
      if (Math.abs(width - this.lastResizeDimensions.width) < 2 && Math.abs(height - this.lastResizeDimensions.height) < 2) {
        return;
      }

      // Update last known dimensions
      this.lastResizeDimensions = { width, height };

      // Clear any existing debounce timer
      if (this.resizeDebounceTimer !== null) {
        window.cancelAnimationFrame(this.resizeDebounceTimer);
      }

      // Use requestAnimationFrame for smoother visual updates
      this.resizeDebounceTimer = window.requestAnimationFrame(() => {
        // Update current dimensions based on observed changes
        this.currentWidth = `${width}px`;
        this.currentHeight = `${height}px`;
        this.resizeDebounceTimer = null;
      });
    });

    // Start observing if expanded
    if (this.open) {
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
   * Handles Safari-specific compatibility issues.
   * Skips if the click originated from an interactive element (e.g. copy-button)
   * to avoid stealing the click from the intended target.
   */
  private handleSafariCompatibility = (e: Event) => {
    // Only apply for Safari
    if (!this.isSafari() || this.isToggling) return;

    // Don't intercept clicks on interactive elements inside the summary
    const target = e.target as HTMLElement;
    if (target?.closest('copy-button') || target?.closest('[slot="summary-actions"]') ||
      target?.closest('button') || target?.closest('a')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Manually handle the toggle via performToggle
    this.performToggle(!this.open);
  };

  /**
   * Cleans up resources when component is destroyed
   */
  /**
   * Adds event listeners for specific child components
   * This ensures proper communication between components
   */
  private addComponentEventListeners() {
    // Listen for pageChange events from any pid-data-table inside this component
    const dataTables = this.el.querySelectorAll('pid-data-table');
    dataTables.forEach(dataTable => {
      dataTable.addEventListener('pageChange', this.handlePageChange as EventListener);
    });
  }

  /**
   * Removes component-specific event listeners
   */
  private removeComponentEventListeners() {
    // Remove pageChange event listeners
    const dataTables = this.el.querySelectorAll('pid-data-table');
    dataTables.forEach(dataTable => {
      dataTable.removeEventListener('pageChange', this.handlePageChange as EventListener);
    });
  }

  private cleanupResources() {
    // Cancel any pending resize animation frame
    if (this.resizeDebounceTimer !== null) {
      window.cancelAnimationFrame(this.resizeDebounceTimer);
      this.resizeDebounceTimer = null;
    }

    // Disconnect ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Remove component-specific event listeners
    this.removeComponentEventListeners();

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

    if (this.open) {
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
    const classesToRemove = ['resize-both', 'overflow-auto', 'w-auto', 'inline-block', 'align-middle', 'align-top', 'overflow-hidden', 'py-0', 'my-0', 'float-left', 'bg-white', 'block'];

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
    this.el.style.overflow = '';
  }

  /**
   * Applies styles for expanded state
   */
  private applyExpandedStyles() {
    try {
      // Apply Tailwind classes for expanded state
      this.el.classList.add(
        'resize-both',
        // 'overflow-auto',
        'relative',
        'block');
      if (this.emphasize) {
        this.el.classList.add('bg-white');
      }

      // Width: use stored user-resized width, configured initial width, or responsive default
      if (this.lastExpandedWidth) {
        this.currentWidth = this.lastExpandedWidth;
      } else if (this.initialWidth) {
        this.currentWidth = this.initialWidth;
      } else {
        this.currentWidth = this.getResponsiveDefaultWidth();
      }

      this.el.style.width = this.currentWidth;

      // Height: set to auto first so the browser lays out the content,
      // then after one paint, measure the actual height and set it as a
      // concrete pixel value. Safari requires a concrete height for
      // resize:both to work; auto alone makes the resize handle inert.
      this.el.style.height = 'auto';
      this.el.style.maxHeight = 'max-content';

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

      // After the browser has laid out the content with height:auto,
      // capture the actual height and set it as a concrete pixel value.
      // This makes resize:both work in Safari and also limits the
      // component height to exactly what the content needs.
      requestAnimationFrame(() => {
        if (this.open) {
          const actualHeight = this.el.scrollHeight;
          this.el.style.height = `${actualHeight}px`;
          this.el.style.maxHeight = `${actualHeight}px`;
        }
      });

      // Observe for resize events
      if (this.resizeObserver) {
        this.resizeObserver.observe(this.el);
      }
    } catch (error) {
      console.error('Failed to apply expanded styles:', error);
    }
  }

  /**
   * Returns a responsive default width based on the actual available width
   * of the container that holds this component.
   *
   * Walks from the pid-collapsible host through shadow roots and
   * pid-component wrappers until it reaches the real layout ancestor
   * in the user's document, then measures its clientWidth.
   *
   *  - Narrow (< 600px, e.g. sidebar, mobile, table cell): 100%
   *  - Medium (600–1024px, e.g. tablet, card in a grid):   50%
   *  - Wide   (> 1024px, e.g. full-width content area):    30%
   */
  private getResponsiveDefaultWidth(): string {
    let node: Node | null = this.el;

    // Escape shadow roots and skip pid-component / pid-collapsible wrappers
    // until we land on a real layout ancestor in the document.
    while (node) {
      // If we're inside a shadow root, jump to its host element
      const root = node.getRootNode();
      if (root instanceof ShadowRoot) {
        node = root.host;
        continue;
      }

      // Skip pid-component and pid-collapsible elements themselves
      if (node instanceof HTMLElement) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'pid-component' || tag === 'pid-collapsible') {
          node = node.parentElement;
          continue;
        }
      }

      // Found a real layout ancestor
      break;
    }

    const container = node instanceof HTMLElement ? node : null;
    const availableWidth = container?.clientWidth ?? window.innerWidth;

    if (availableWidth < 600) {
      return '100%';
    }
    if (availableWidth <= 1024) {
      return '70%';
    }
    return '50%';
  }

  /**
   * Calculates content dimensions for optimal sizing
   */
  private calculateContentDimensions() {
    const contentElement = this.el.querySelector('.grow');
    const contentWidth = contentElement?.scrollWidth || CONSTANTS.MIN_WIDTH;
    const contentHeight = contentElement?.scrollHeight || CONSTANTS.MIN_HEIGHT;

    // Add padding for better appearance, plus footer height if footer is shown
    const footerHeight = this.showFooter ? CONSTANTS.FOOTER_HEIGHT : 0;
    const maxWidth = contentWidth + CONSTANTS.PADDING_WIDTH;
    const maxHeight = contentHeight + CONSTANTS.PADDING_HEIGHT + footerHeight;

    return { contentWidth, contentHeight, maxWidth, maxHeight };
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

    // Use the stored dimensions for logging/debugging
    if (this.lastExpandedWidth || this.lastExpandedHeight) {
      console.debug('Storing dimensions for later restoration:', {
        width: this.lastExpandedWidth,
        height: this.lastExpandedHeight,
      });
    }

    // Clear size constraints
    this.el.style.maxWidth = '';
    this.el.style.maxHeight = '';

    // Auto width for collapsed state
    this.el.style.width = 'auto';

    // Apply Tailwind classes for collapsed state (inline with text, no float)
    // NOTE: Using overflow:clip instead of overflow:hidden because overflow:hidden
    // on an inline-block changes its baseline to the bottom margin edge (CSS spec),
    // which breaks vertical alignment with surrounding text.
    this.el.classList.add('w-auto', 'inline-block', 'py-0', 'my-0');
    this.el.style.overflow = 'clip';

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
    const resizeIndicators = this.el.querySelectorAll('.resize-indicator');
    resizeIndicators.forEach(indicator => indicator.remove());
  }

  /**
   * Handles the toggle event from the native <details> element.
   * We suppress native toggles entirely and drive the state ourselves
   * from the summary click handler, which gives us double-click detection.
   */
  private handleToggle = (event: Event) => {
    // Always suppress the native toggle — we drive state from handleSummaryClick
    event.preventDefault();
    event.stopPropagation();
    const details = this.el.querySelector('details');
    if (details) {
      // Re-sync native state to our state (undo what the browser just did)
      details.open = this.open;
    }
  };

  /**
   * Click handler installed on <summary>. Detects double-clicks by tracking
   * the interval between consecutive clicks:
   * - Single click: toggle open/closed as usual.
   * - Double click (two clicks within 300 ms): close the collapsible.
   */
  private handleSummaryClick = (event: MouseEvent) => {
    // Don't intercept clicks on interactive elements inside the summary
    // (e.g. copy-button, links). Only handle clicks on the summary itself.
    // Use composedPath() to reliably find the actual click target across
    // shadow DOM boundaries.
    const path = event.composedPath() as HTMLElement[];
    const clickedInteractive = path.some(el =>
        el instanceof HTMLElement && (
          el.tagName === 'BUTTON' ||
          el.tagName === 'A' ||
          el.tagName === 'COPY-BUTTON' ||
          el.tagName === 'PID-ACTIONS' ||
          el.getAttribute?.('role') === 'button'
        ),
    );
    if (clickedInteractive) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.isToggling) return;

    const now = Date.now();
    const elapsed = now - this.lastClickTime;
    this.lastClickTime = now;

    // Cancel any pending single-click action
    if (this.pendingClickTimer !== null) {
      clearTimeout(this.pendingClickTimer);
      this.pendingClickTimer = null;
    }

    if (elapsed < 300 && this.open) {
      // Double-click detected while open → close immediately
      this.performToggle(false);
    } else {
      // Defer single-click toggle to give double-click a window
      this.pendingClickTimer = setTimeout(() => {
        this.pendingClickTimer = null;
        this.performToggle(!this.open);
      }, 200);
    }
  };

  /**
   * Applies the desired open/closed state, syncs the <details> element,
   * emits the toggle event, and updates appearance.
   */
  private performToggle(newOpen: boolean) {
    this.isToggling = true;

    const details = this.el.querySelector('details');
    this.open = newOpen;
    if (details) {
      details.open = newOpen;
    }

    this.collapsibleToggle.emit(this.open);
    this.updateAppearance();

    // For Safari compatibility
    if (this.open && this.isSafari()) {
      setTimeout(() => this.recalculateContentDimensions(), 50);
    }

    // Reset toggling flag
    setTimeout(() => {
      // Final sync to ensure consistency
      if (details) details.open = this.open;
      this.isToggling = false;
    }, 50);
  }

  /**
   * Gets host classes based on current state
   */
  private getHostClasses() {
    const baseClasses = ['relative', 'font-sans', 'leading-normal'];

    // Add emphasis classes (border, shadow, and horizontal margin for spacing)
    if (this.emphasize) {
      // baseClasses.push('mx-2');
      baseClasses.push('box-border', 'border', 'rounded-md', 'shadow-xs');
      if (this.isDarkMode) {
        baseClasses.push('border-gray-600');
      } else {
        baseClasses.push('border-gray-300');
      }
    }

    // Add state-specific classes
    if (this.open) {
      // Expanded: block-level display, dimensions controlled via inline styles by recalculateContentDimensions()
      baseClasses.push('mb-2', 'max-w-full', 'text-xs', 'block');
    } else {
      // Collapsed: inline with text, no float (float causes clear/line-break issues)
      // Use max-w-md for top-level (~30% width cap), max-w-full for subcomponents in constrained spaces
      baseClasses.push(this.initialWidth === '100%' ? 'max-w-full' : 'max-w-md');
      baseClasses.push('my-0', 'text-sm', 'inline-block');
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

    if (this.open) {
      // baseClasses.push('h-full', 'overflow-visible');
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
      'focus:outline-hidden',
      'focus-visible:ring-2',
      'focus-visible:ring-blue-400',
      'focus-visible:ring-offset-1',
      'rounded-lg',
      'marker:hidden',
      '[&::-webkit-details-marker]:hidden',
      'select-none',
      'py-0',
      'min-w-1/10',
    ];

    if (this.open) {
      baseClasses.push('sticky', 'top-0', `z-${Z_INDICES.STICKY_ELEMENTS}`, 'overflow-x-auto', 'backdrop-blur-xs');
      if (this.isDarkMode) {
        baseClasses.push('bg-gray-800');
        if (this.emphasize) {
          baseClasses.push('border-b', 'box-border', 'border-gray-700');
        }
      } else {
        baseClasses.push('bg-white', 'text-ellipsis');
        if (this.emphasize) {
          baseClasses.push('border-b', 'box-border', 'border-gray-100');
        }
      }
    } else {
      baseClasses.push('whitespace-nowrap', 'overflow-hidden', 'text-ellipsis', 'truncate', 'max-w-full');
    }

    // Apply consistent height for both states
    baseClasses.push(`h-[${this.lineHeight}px]`);

    return baseClasses.join(' ');
  }

  /**
   * Gets classes for the content area
   */
  private getContentClasses() {
    const baseClasses = ['grow', 'flex', 'flex-col', 'min-h-0'];

    if (this.open) {
      // baseClasses.push('overflow-auto', 'p-2');
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
    const baseClasses = ['flex', 'flex-col', 'w-full', 'mt-auto', 'sticky', 'bottom-0', 'left-0', 'right-0', 'border-t', `z-${Z_INDICES.FOOTER_CONTENT}`, 'backdrop-blur-xs'];

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
    const baseClasses = ['flex', 'items-center', 'justify-between', 'gap-2', 'p-1', 'min-h-12', 'shrink-0', 'overflow-x-auto'];

    // Add dark mode classes
    if (this.isDarkMode) {
      baseClasses.push('bg-gray-800');
    } else {
      baseClasses.push('bg-white');
    }

    return baseClasses.join(' ');
  }
}
