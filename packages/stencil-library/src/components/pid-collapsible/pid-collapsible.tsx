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
    this.updateSizing();
  }

  /**
   * Updates the component sizing based on expanded state
   */
  private updateSizing() {
    if (this.expanded) {
      // For expanded state
      this.el.classList.add('resize-both', 'overflow-auto', 'min-w-[500px]', 'min-h-[300px]', 'max-w-full', 'float-left', 'bg-white');

      // Set width and height
      this.el.style.width = this.currentWidth;
      this.el.style.height = this.currentHeight;

      // Add resize indicator
      this.addResizeIndicator();
    } else {
      // For collapsed state
      this.el.classList.remove('resize-both', 'min-w-[500px]', 'min-h-[300px]', 'max-w-full', 'overflow-auto');

      // Save current dimensions before collapsing
      if (this.el.style.width) {
        this.currentWidth = this.el.style.width;
      }
      if (this.el.style.height) {
        this.currentHeight = this.el.style.height;
      }

      // Add collapsed state classes
      this.el.classList.add('w-auto', 'float-left', 'inline-block', 'align-middle', 'overflow-hidden', 'py-0', 'my-0');

      // Apply line height for text sizing
      this.el.style.height = `${this.lineHeight}px`;
      this.el.style.lineHeight = `${this.lineHeight}px`;

      // Remove resize indicator
      this.removeResizeIndicator();
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

  /**
   * Handles the toggle event
   */
  private handleToggle = (event: Event) => {
    const details = (event.target as HTMLElement).closest('details');
    if (details) {
      this.expanded = details.open;
      this.collapsibleToggle.emit(this.expanded);
    }
  };

  render() {
    return (
      <Host
        class={`relative ${this.emphasize ? 'border border-gray-300 rounded-md shadow-sm' : ''} mr-4 float-left
        ${this.expanded ? 'mb-4 max-w-full resize-both overflow-auto' : 'my-0 inline-block align-middle overflow-hidden'}
        bg-white font-sans ${this.expanded ? 'text-xs' : 'text-sm'}`}
        style={
          !this.expanded
            ? {
                height: `${this.lineHeight}px`,
                lineHeight: `${this.lineHeight}px`,
              }
            : {}
        }
      >
        <details class="group w-full text-clip font-sans transition-all duration-200 ease-in-out flex flex-col h-full" open={this.open} onToggle={this.handleToggle}>
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
          <div class="flex-grow overflow-auto">
            <slot></slot>
          </div>
        </details>
      </Host>
    );
  }
}
