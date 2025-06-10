import { Component, Element, Event, EventEmitter, h, Host, Prop, State, Watch } from '@stencil/core';

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

  /**
   * Watch for changes in the open property
   */
  @Watch('open')
  watchOpen() {
    this.expanded = this.open;
    this.updateSizing();
  }

  /**
   * Watch for changes in the expanded property
   */
  @Watch('expanded')
  watchExpanded() {
    this.updateSizing();
  }

  componentWillLoad() {
    this.expanded = this.open;
    this.currentWidth = this.initialWidth || '500px';
    this.currentHeight = this.initialHeight || '300px';
  }

  componentDidLoad() {
    // Clean up any existing ResizeObserver to prevent memory leaks
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.updateSizing();

    // Add event listeners for Safari compatibility
    this.addSafariCompatibilityListeners();

    // Initialize ResizeObserver to only track dimensions without auto-resizing
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (this.expanded) {
          // Simply track current dimensions without modifying them automatically
          const currentWidth = entry.contentRect.width;
          const currentHeight = entry.contentRect.height;

          // Just update state without auto-resizing
          this.currentWidth = `${currentWidth}px`;
          this.currentHeight = `${currentHeight}px`;
        }
      }
    });

    // Start observing the element if expanded
    if (this.expanded) {
      this.resizeObserver.observe(this.el);
    }
  }

  /**
   * Add event listeners for Safari compatibility
   */
  private addSafariCompatibilityListeners() {
    // Get the details element
    const details = this.el.querySelector('details');
    if (!details) return;

    // Add click listener to summary to handle Safari-specific issues
    const summary = details.querySelector('summary');
    if (summary) {
      summary.addEventListener(
        'click',
        e => {
          // Check if we're running in Safari
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

          // Only apply Safari-specific handling in Safari browsers
          if (isSafari) {
            // If we're already in the process of toggling, ignore this event
            if (this.isToggling) {
              return;
            }

            // Set the flag to prevent recursive calls
            this.isToggling = true;

            // Prevent the default toggle behavior in Safari
            e.preventDefault();
            e.stopPropagation();

            // Manually toggle the expanded state
            this.expanded = !this.expanded;

            // Force the details element to match our expanded state
            details.open = this.expanded;

            // Emit the event
            this.collapsibleToggle.emit(this.expanded);

            // Update sizing based on new state
            this.updateSizing();

            // Reset the flag after a short delay
            setTimeout(() => {
              this.isToggling = false;
            }, 100);
          }
        },
        { capture: true },
      );
    }
  }

  disconnectedCallback() {
    // Clean up ResizeObserver when component is removed
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Clean up event listeners
    const details = this.el.querySelector('details');
    if (details) {
      const summary = details.querySelector('summary');
      if (summary) {
        summary.removeEventListener('click', () => {}, { capture: true });
      }
    }
  }

  /**
   * Updates the component sizing based on expanded state
   */
  private updateSizing() {
    if (this.expanded) {
      // For expanded state
      this.el.classList.add('resize-both', 'overflow-auto', 'float-left', 'bg-white');

      // Use min-width and min-height with larger values to ensure UI elements remain visible
      this.el.classList.add('min-w-[350px]', 'min-h-[250px]');

      // Calculate content dimensions
      const contentElement = this.el.querySelector('.flex-grow');
      const contentWidth = contentElement?.scrollWidth || 300;
      const contentHeight = contentElement?.scrollHeight || 200;

      // Add padding to content dimensions for better appearance
      const maxWidth = contentWidth + 40;
      const maxHeight = contentHeight + 60;

      // Set max-width and max-height constraints
      this.el.style.maxWidth = `${maxWidth}px`;
      this.el.style.maxHeight = `${maxHeight}px`;

      // Set width and height based on content size if not already set
      if (!this.currentWidth || this.currentWidth === '500px') {
        // Get content size and add some padding
        this.currentWidth = `${Math.min(Math.max(contentWidth + 40, 300), maxWidth)}px`;
      } else {
        // Ensure width doesn't exceed content width
        const numericWidth = parseInt(this.currentWidth, 10);
        if (numericWidth > maxWidth) {
          this.currentWidth = `${maxWidth}px`;
        }
      }

      if (!this.currentHeight || this.currentHeight === '300px') {
        // Get content size and add some padding
        this.currentHeight = `${Math.min(Math.max(contentHeight + 60, 200), maxHeight)}px`;
      } else {
        // Ensure height doesn't exceed content height
        const numericHeight = parseInt(this.currentHeight, 10);
        if (numericHeight > maxHeight) {
          this.currentHeight = `${maxHeight}px`;
        }
      }

      // Set width and height
      this.el.style.width = this.currentWidth;
      this.el.style.height = this.currentHeight;

      // Explicitly set resize property
      this.el.style.resize = 'both';

      // Add resize indicator
      this.addResizeIndicator();

      // Start observing resize events
      if (this.resizeObserver) {
        this.resizeObserver.observe(this.el);
      }
    } else {
      // For collapsed state
      this.el.classList.remove('resize-both', 'min-w-[350px]', 'min-h-[250px]', 'overflow-auto');

      // Clear max-width and max-height constraints
      this.el.style.maxWidth = '';
      this.el.style.maxHeight = '';

      // Save current dimensions before collapsing
      if (this.el.style.width) {
        this.currentWidth = this.el.style.width;
      }
      if (this.el.style.height) {
        this.currentHeight = this.el.style.height;
      }

      // Reset width to auto to fit content in collapsed state
      this.el.style.width = 'auto';

      // Add collapsed state classes
      this.el.classList.add('w-auto', 'float-left', 'inline-block', 'align-middle', 'overflow-hidden', 'py-0', 'my-0');

      // Apply line height for text sizing
      this.el.style.height = `${this.lineHeight}px`;
      this.el.style.lineHeight = `${this.lineHeight}px`;

      // Remove resize property
      this.el.style.resize = 'none';

      // Remove resize indicator
      this.removeResizeIndicator();

      // Stop observing resize events
      if (this.resizeObserver) {
        this.resizeObserver.unobserve(this.el);
      }
    }
  }

  /**
   * Adds resize indicator to the component
   */
  private addResizeIndicator() {
    // Remove any existing resize indicators first
    this.removeResizeIndicator();

    // Create and add the resize indicator
    const resizeIndicator = document.createElement('div');
    resizeIndicator.className = 'absolute bottom-0 right-0 w-4 h-4 opacity-100 pointer-events-none resize-indicator z-50';
    resizeIndicator.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L2 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 8L8 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 14L14 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
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

  // Flag to prevent recursive toggle calls
  private isToggling = false;

  /**
   * Handles the toggle event
   */
  private handleToggle = (event: Event) => {
    // If we're already in the process of toggling, ignore this event
    if (this.isToggling) {
      return;
    }

    // Set the flag to prevent recursive calls
    this.isToggling = true;

    // Immediately stop propagation and prevent default to avoid any bubbling
    event.stopPropagation();
    event.preventDefault();

    // Stop immediate propagation to prevent any other listeners from being called
    if (event.cancelable) {
      event.stopImmediatePropagation();
    }

    // Get the details element directly from this component instead of from event target
    // This fixes issues when clicking on nested elements or subcomponents
    const details = this.el.querySelector('details');
    if (details) {
      // Toggle the expanded state
      this.expanded = !this.expanded;

      // Force the details element to match our expanded state
      details.open = this.expanded;

      // Emit the event
      this.collapsibleToggle.emit(this.expanded);

      // Update sizing based on new state
      this.updateSizing();

      // Safari-specific: ensure the details element's open state is correctly set
      // This helps with Safari's handling of the details element
      setTimeout(() => {
        if (details.open !== this.expanded) {
          details.open = this.expanded;
        }
        // Reset the flag after a short delay to allow for any animations to complete
        setTimeout(() => {
          this.isToggling = false;
        }, 100);
      }, 0);
    } else {
      // Reset the flag if we didn't find a details element
      this.isToggling = false;
    }
  };

  render() {
    // No automatic resizing on render, let the regular component lifecycle handle it

    // Create resize indicator if expanded
    const resizeIndicator = this.expanded ? (
      <div class="absolute bottom-0 right-0 w-4 h-4 opacity-100 pointer-events-none z-50">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 2L2 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
          <path d="M22 8L8 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
          <path d="M22 14L14 22" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
    ) : null;

    return (
      <Host
        class={`relative ${this.emphasize ? 'border border-gray-300 rounded-md shadow-sm' : ''} mr-4 float-left
        ${this.expanded ? 'mb-4 overflow-auto max-w-full' : 'my-0 inline-block align-middle overflow-hidden'}
        bg-white font-sans ${this.expanded ? 'text-xs' : 'text-sm'}`}
        style={{
          ...(this.expanded ? { resize: 'both' } : {}),
          ...(this.expanded
            ? {}
            : {
                height: `${this.lineHeight}px`,
                lineHeight: `${this.lineHeight}px`,
              }),
        }}
      >
        <details
          class="group w-full text-clip font-sans transition-all duration-200 ease-in-out flex flex-col h-full"
          open={this.open}
          onToggle={this.handleToggle}
          onClick={e => {
            // More aggressive stopPropagation to prevent parent handlers from interfering
            e.stopPropagation();
            e.stopImmediatePropagation();
          }}
        >
          <summary
            class={`font-bold font-mono cursor-pointer list-none flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg marker:hidden ${this.expanded ? 'sticky top-0 bg-white z-10 border-b border-gray-100 p-1 overflow-visible' : 'px-0.5 py-0 whitespace-nowrap text-ellipsis overflow-hidden'}`}
            style={
              !this.expanded
                ? {
                    height: `${this.lineHeight}px`,
                    lineHeight: `${this.lineHeight}px`,
                  }
                : {}
            }
            onClick={e => {
              // Capture and handle click events on summary to prevent bubbling
              e.stopPropagation();
              e.stopImmediatePropagation();
            }}
          >
            <span class={`inline-flex pr-1 items-center ${this.expanded ? 'flex-wrap overflow-visible' : 'flex-nowrap overflow-x-auto'}`}>
              {this.emphasize ? (
                <span class={'flex-shrink-0 pr-1'}>
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
              ) : null}
              <slot name="summary"></slot>
            </span>
            <slot name="summary-actions"></slot>
          </summary>
          <div class="flex-grow overflow-auto flex flex-col h-full min-h-0">
            <slot></slot>
          </div>
        </details>
        {resizeIndicator}
      </Host>
    );
  }
}
