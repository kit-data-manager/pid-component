// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Debounce timer for resize optimization
  private resizeDebounceTimer: number = null;

  // Last known resize dimensions
  private lastResizeDimensions = { width: 0, height: 0 };

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

    // When expanded, ensure content dimensions are properly calculated
    if (this.expanded) {
      // Use setTimeout to ensure DOM is updated before recalculating
      setTimeout(() => {
        this.recalculateContentDimensions();
      }, 0);
    }
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

    // Initialize dimensions but delay actual calculation until content is rendered
    if (this.initialWidth) {
      this.currentWidth = this.initialWidth;
    } else {
      // Default to 75% width if no initial width is provided
      this.currentWidth = '75%';
    }

    if (this.initialHeight) {
      this.currentHeight = this.initialHeight;
    } else {
      // Use default height initially, will be recalculated after content renders
      this.currentHeight = CONSTANTS.DEFAULT_HEIGHT;
    }

    // Initialize dark mode
    this.initializeDarkMode();
  }

  componentDidLoad() {
    this.setupResizeObserver();
    this.updateAppearance();
    this.addBrowserCompatibilityListeners();
    this.addComponentEventListeners();

    // When component is initially open, ensure dimensions are properly calculated after rendering
    if (this.open) {
      // Use a small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        // Force recalculation of dimensions for open components
        this.recalculateContentDimensions();
      }, 50);
    }

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
   * Listens to page changes from pid-data-table and recalculates dimensions
   * @param event The page change event
   */
  private handlePageChange = (event: CustomEvent<number>) => {
    // When the page changes, recalculate dimensions after the DOM updates
    console.debug('Page changed to:', event.detail);
    this.recalculateContentDimensions();
  };

  /**
   * Public method to recalculate content dimensions
   * Can be called externally, for example when pagination changes
   * Optimized for better performance
   */
  @Method()
  public async recalculateContentDimensions() {
    if (this.expanded) {
      // Add a class to optimize rendering during recalculation
      this.el.classList.add('resizing');

      // Use a small delay to avoid excessive recalculations
      // when multiple events happen in quick succession
      if (this.resizeDebounceTimer !== null) {
        window.cancelAnimationFrame(this.resizeDebounceTimer);
      }

      return new Promise<any>(resolve => {
        this.resizeDebounceTimer = window.requestAnimationFrame(() => {
          const dimensions = this.calculateContentDimensions();

          // Batch all style changes in a single rendering frame
          // to avoid forced reflows and optimize performance
          requestAnimationFrame(() => {
            // Set max dimensions first - add a buffer to prevent too tight constraints
            const maxWidth = Math.max(dimensions.maxWidth, dimensions.contentWidth + CONSTANTS.PADDING_WIDTH);
            const maxHeight = Math.max(dimensions.maxHeight, dimensions.contentHeight + CONSTANTS.PADDING_HEIGHT + (this.showFooter ? CONSTANTS.FOOTER_HEIGHT : 0));

            this.el.style.maxWidth = `${maxWidth}px`;
            this.el.style.maxHeight = `${maxHeight}px`;

            // Update current dimensions to match content exactly
            // Ensure width is at least 75% of container if no width is explicitly provided
            const optimalWidth = dimensions.contentWidth + CONSTANTS.PADDING_WIDTH;
            const optimalHeight = dimensions.contentHeight + CONSTANTS.PADDING_HEIGHT + (this.showFooter ? CONSTANTS.FOOTER_HEIGHT : 0);

            // If initial width/height is specified, prefer that for first calculation
            if (!this.currentWidth || this.currentWidth === 'auto') {
              // Default to 75% width if no initial width is provided
              this.currentWidth = this.initialWidth || '75%';
            } else if (!this.initialWidth) {
              // If no initial width was specified but we have a current width,
              // preserve the 75% width setting rather than calculating a pixel value
              this.currentWidth = '75%';
            } else {
              // Otherwise use the calculated optimal width with extra space for content
              this.currentWidth = `${Math.max(optimalWidth, dimensions.contentWidth * 1)}px`;
            }

            if (!this.currentHeight || this.currentHeight === `${this.lineHeight}px`) {
              this.currentHeight = this.initialHeight || `${optimalHeight}px`;
            } else {
              // Set the height to exactly match the content height plus padding
              this.currentHeight = `${optimalHeight}px`;
            }

            // Apply the content-based dimensions
            this.el.style.width = this.currentWidth;
            this.el.style.height = this.currentHeight;

            // Store these as the last expanded dimensions
            this.lastExpandedWidth = this.currentWidth;
            this.lastExpandedHeight = this.currentHeight;

            // Emit event with calculated dimensions for external components
            this.contentHeightChange.emit({ maxHeight });

            // Remove optimization class
            this.el.classList.remove('resizing');
            this.resizeDebounceTimer = null;

            resolve(dimensions);
          });
        });
      });
    }
    return null;
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

    // Create new observer with debouncing for better performance
    this.resizeObserver = new ResizeObserver(entries => {
      // Only track dimensions when expanded
      if (!this.expanded) return;

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
    // Get the actual visible content width/height (not just scroll dimensions)
    const contentWidth = contentElement ? Math.max((contentElement as HTMLElement).offsetWidth, contentElement?.scrollWidth || 0) : CONSTANTS.MIN_WIDTH;
    const contentHeight = contentElement ? Math.max((contentElement as HTMLElement).offsetHeight, contentElement?.scrollHeight || 0) : CONSTANTS.MIN_HEIGHT;

    // Add padding for better appearance, plus footer height if footer is shown
    const footerHeight = this.showFooter ? CONSTANTS.FOOTER_HEIGHT : 0;
    const maxWidth = contentWidth + CONSTANTS.PADDING_WIDTH;
    // Use actual content height rather than adding arbitrary padding
    const maxHeight = contentHeight + CONSTANTS.PADDING_HEIGHT + footerHeight;

    return { contentWidth, contentHeight, maxWidth, maxHeight };
  }

  /**
   * Updates dimensions based on content and constraints
   * Optimized for better resize performance
   */
  private updateDimensions(dimensions: { contentWidth: number; contentHeight: number; maxWidth: number; maxHeight: number }) {
    // Add a rendering optimization class during dimension updates
    this.el.classList.add('resizing');

    const { contentWidth, contentHeight, maxWidth, maxHeight } = dimensions;

    // Calculate initial width based on content but prefer initialWidth if provided
    let optimalWidth;
    if (this.initialWidth) {
      // Use initialWidth directly if provided
      this.currentWidth = this.initialWidth;
    } else {
      // Calculate a content-based width with minimal padding
      optimalWidth = Math.min(Math.max(contentWidth + CONSTANTS.PADDING_WIDTH, CONSTANTS.MIN_WIDTH), maxWidth);
      // Default to 75% if we don't have specific content dimensions
      this.currentWidth = contentWidth > 0 ? `${optimalWidth}px` : '75%';
    }

    // Calculate optimal height based on actual content
    const footerHeight = this.showFooter ? CONSTANTS.FOOTER_HEIGHT : 0;

    // Use more precise content height calculation to prevent extra space
    // Add minimal padding to prevent content being cut off
    const minPadding = 20; // Minimal padding to prevent content being cut off
    const calculatedHeight = contentHeight + minPadding + footerHeight;

    // Use initialHeight if provided, otherwise use calculated height
    if (this.initialHeight) {
      this.currentHeight = this.initialHeight;
    } else {
      // Ensure height is between min height and max height constraints
      const optimalHeight = Math.min(Math.max(calculatedHeight, CONSTANTS.MIN_HEIGHT), maxHeight);
      this.currentHeight = `${optimalHeight}px`;
    }

    // Store these dimensions for future reference
    this.lastExpandedWidth = this.currentWidth;
    this.lastExpandedHeight = this.currentHeight;

    // Use direct property setting for better performance
    // Batch dimension changes in a single rendering frame
    requestAnimationFrame(() => {
      this.el.style.width = this.currentWidth;
      this.el.style.height = this.currentHeight;

      // Set min-height/min-width to prevent resizing smaller than content
      this.el.style.minHeight = `${Math.max(calculatedHeight, CONSTANTS.MIN_HEIGHT)}px`;
      this.el.style.minWidth = `${CONSTANTS.MIN_WIDTH}px`;

      // Also set max-height/max-width to prevent excessive resizing
      this.el.style.maxHeight = `${maxHeight}px`;
      this.el.style.maxWidth = `${maxWidth}px`;

      // Remove the optimization class after updates are applied
      this.el.classList.remove('resizing');
    });
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
      console.debug('Storing dimensions for later restoration:', { width: this.lastExpandedWidth, height: this.lastExpandedHeight });
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
    // Start with base classes without width since we'll calculate that properly
    const baseClasses = ['relative', 'mx-2', 'font-sans', 'transition-all', 'duration-200', 'ease-in-out', 'box-border', 'leading-normal'];

    // Add w-3/4 class by default to maintain consistent width
    baseClasses.push('w-3/4');

    // When expanded, additional classes will be applied through inline styles

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

          <div class={`${contentClasses}`}>
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
