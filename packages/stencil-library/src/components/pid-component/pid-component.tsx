import { Component, Element, Fragment, h, Host, Method, Prop, State, Watch } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';
import { Database } from '../../utils/IndexedDBUtil';
import { clearCache } from '../../utils/DataCache';

@Component({
  tag: 'pid-component',
  styleUrl: 'pid-component.css',
  shadow: false,
})
export class PidComponent {
  /**
   * Reference to the host element for direct DOM manipulation
   */
  @Element() el: HTMLElement;

  /**
   * The value to parse, evaluate and render.
   * @type {string}
   */
  @Prop() value: string;

  /**
   * A stringified JSON object containing settings for this component.
   * The resulting object is passed to every subcomponent, so that every component has the same settings.
   * Values and the according type are defined by the components themselves.
   * (optional)
   *
   * Schema:
   * ```typescript
   * {
   *  type: string,
   *  values: {
   *   name: string,
   *   value: any
   *  }[]
   * }[]
   * ```
   * @type {string}
   */
  @Prop() settings: string = '[]';

  /**
   * Determines whether the component is open or not by default.
   * (optional)
   * @type {boolean}
   */
  @Prop() openByDefault: boolean;

  /**
   * The number of items to show in the table per page.
   * Defaults to 10.
   * (optional)
   * @type {number}
   */
  @Prop() amountOfItems: number = 10;

  /**
   * The total number of levels of subcomponents to show.
   * Defaults to 1.
   * (optional)
   * @type {number}
   */
  @Prop() levelOfSubcomponents: number = 1;

  /**
   * The current level of subcomponents.
   * Defaults to 0.
   * (optional)
   * @type {number}
   */
  @Prop() currentLevelOfSubcomponents: number = 0;

  /**
   * Determines whether subcomponents should generally be shown or not.
   * If set to true, the component won't show any subcomponents.
   * If not set, the component will show subcomponents
   * if the current level of subcomponents is not the total level of subcomponents or greater.
   * (optional)
   * @type {boolean}
   */
  @Prop() hideSubcomponents: boolean;

  /**
   * Determines whether components should be emphasized towards their surrounding by border and shadow.
   * If set to true, border and shadows will be shown around the component.
   * It not set, the component won't be surrounded by border and shadow.
   * (optional)
   * @type {boolean}
   */
  @Prop() emphasizeComponent: boolean = true;

  /**
   * Determines whether on the top level the copy button is shown.
   * If set to true, the copy button is shown also on the top level.
   * It not set, the copy button is only shown for sub-components.
   * (optional)
   * @type {boolean}
   */
  @Prop() showTopLevelCopy: boolean = true;

  /**
   * Determines the default time to live (TTL) for entries in the IndexedDB.
   * Defaults to 24 hours.
   * Units are in milliseconds.
   * (optional)
   * @type {number}
   * @default 24 * 60 * 60 * 1000
   */
  @Prop() defaultTTL: number = 24 * 60 * 60 * 1000;

  /**
   * Initial width of the component (e.g. '500px', '50%').
   * If not set, defaults to 500px on large screens, 400px on medium screens, and 300px on small screens.
   * @type {string}
   */
  @Prop() width?: string;

  /**
   * Initial height of the component (e.g. '300px', '50vh').
   * If not set, defaults to 300px.
   * @type {string}
   */
  @Prop() height?: string;

  /**
   * Updates the component sizing and styling based on the expanded state
   */
  @Method()
  async updateComponentSizing() {
    if (this.isExpanded) {
      // For expanded state, use Tailwind classes only
      this.el.classList.add('resize-both');
      this.el.classList.add('overflow-auto');
      this.el.classList.add('min-w-[500px]');
      this.el.classList.add('min-h-[300px]');
      this.el.classList.add('w-[500px]');
      this.el.classList.add('h-[300px]');
      this.el.classList.add('max-w-full');
      this.el.classList.add('float-left');
      this.el.classList.add('bg-white');

      // Set width and height through classes to respect Tailwind
      if (this.width) {
        this.el.style.width = this.width;
      }

      if (this.height) {
        this.el.style.height = this.height;
      }

      // Remove any existing resize indicators first to avoid duplicates
      this.el.querySelectorAll('.resize-indicator').forEach(element => element.remove());

      // Show resize indicator only when expanded
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

      // Create pseudo-element for resize handle to make it more visible and usable
      const style = document.createElement('style');
      style.innerHTML = `
          #${this.el.id} {
            resize: both !important;
            overflow: auto !important;
          }
        `;
      document.head.appendChild(style);
      this.el.dataset.hasResizeStyle = 'true';
    } else {
      // Component is collapsed - fit to a single line
      this.el.classList.remove('resize-both');
      this.el.classList.remove('min-w-[500px]');
      this.el.classList.remove('min-h-[300px]');
      this.el.classList.remove('w-[500px]');
      this.el.classList.remove('h-[300px]');
      this.el.classList.remove('max-w-full');
      this.el.classList.remove('overflow-auto');

      // Reset to original state or pre-resize dimensions
      this._currentExpandedWidth = null;
      this._currentExpandedHeight = null;

      // Add specific collapsed state classes
      this.el.classList.add('w-auto');
      this.el.classList.add('float-left');
      this.el.classList.add('inline-block');
      this.el.classList.add('align-middle');
      this.el.classList.add('overflow-hidden');
      this.el.classList.add('py-0');
      this.el.classList.add('my-0');

      // Apply computed line height for text sizing
      const lineHeight = this._lineHeight || 24; // Default fallback
      this.el.style.height = `${lineHeight}px`;
      this.el.style.lineHeight = `${lineHeight}px`;

      // Hide resize indicator when collapsed
      const resizeIndicator = this.el.querySelector('.resize-indicator');
      if (resizeIndicator) {
        resizeIndicator.remove();
      }

      // Remove resize handle if it exists
      if (this.el.dataset.hasResizeHandle === 'true') {
        const resizeHandle = this.el.querySelector('.resize-handle');
        if (resizeHandle) {
          resizeHandle.remove();
        }
        delete this.el.dataset.hasResizeHandle;
      }
    }
  }

  // Height property already defined above in updateComponentSizing method

  /**
   * Stores the parsed identifier object.
   */
  @State() identifierObject: GenericIdentifierType;

  /**
   * Lists all the items to show in the table.
   */
  @State() items: FoldableItem[] = [];

  /**
   * Lists all the actions to show in the table.
   */
  @State() actions: FoldableAction[] = [];

  /**
   * Determines whether the subcomponents should be loaded or not.
   */
  @State() loadSubcomponents: boolean = false;

  /**
   * The current status of the component.
   * Can be "loading", "loaded" or "error".
   * Default to "loading".
   */
  @State() displayStatus: 'loading' | 'loaded' | 'error' = 'loading';

  /**
   * The current page of the table.
   */
  @State() tablePage: number = 0;

  /**
   * Determines whether the component should be temporarily visible or not.
   */
  @State() temporarilyEmphasized: boolean = false;

  /**
   * Tracks whether the component is expanded/unfolded or not
   */
  @State() isExpanded: boolean = false;

  constructor() {
    this.temporarilyEmphasized = this.emphasizeComponent;
    this.isExpanded = this.openByDefault || false;
  }

  componentDidLoad() {
    // Add clear-after to prevent text from flowing under the component
    this.el.classList.add('after:content-[""]', 'after:block', 'after:clear-both');

    // Initialize component based on expanded state
    this.updateComponentSizing();

    // Initialize component ID for resize handle references
    if (!this.el.id) {
      this.el.id = `pid-component-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add event listener for resize handle
    if (this.isExpanded) {
      // Allow resizing through mouse interaction when expanded
      this.el.style.resize = 'both';
      this.el.style.overflow = 'auto';

      // Initialize resize observer to ensure proper display after manual resizing
      this._resizeObserver = new ResizeObserver(() => {
        // Ensure table cells maintain their layout during resize
        const valueCells = this.el.querySelectorAll('.value-cell');
        valueCells.forEach(cell => {
          const copyButton = cell.querySelector('copy-button');
          if (copyButton) {
            copyButton.classList.add('absolute', 'right-2', 'top-2');
          }
        });
      });
      this._resizeObserver.observe(this.el);
    }
  }

  /**
   * Watches the value property and calls connectedCallback() if it changes.
   * This is important for the different pages inside the table, since the magic-display components are not rerendered by default on value or state change.
   */
  @Watch('value')
  async watchValue() {
    this.displayStatus = 'loading';
    // this.identifierObject = undefined;
    await this.componentWillLoad();
  }

  /**
   * Watches the loadSubcomponents property and sets the temporarilyEmphasized property based on emphasizeComponent and loadSubcomponents.
   */
  @Watch('loadSubcomponents')
  async watchLoadSubcomponents() {
    this.temporarilyEmphasized = this.emphasizeComponent || this.loadSubcomponents;

    // Default line height based on typical text
    this._lineHeight = 24; // Default value before computation
  }

  /**
   * Watches the emphasizeComponent property to update temporarilyEmphasized.
   */
  @Watch('emphasizeComponent')
  watchEmphasizeComponent() {
    this.temporarilyEmphasized = this.emphasizeComponent || this.loadSubcomponents;
  }

  @Watch('openByDefault')
  watchOpenByDefault() {
    this.isExpanded = this.openByDefault;
    if (!this.isExpanded) {
      // Save current dimensions before collapsing
      if (this.isExpanded) {
        this._currentExpandedWidth = this.el.style.width;
        this._currentExpandedHeight = this.el.style.height;
      }
    } else {
      // When expanding
      if (!this._originalWidth) {
        // First time expanding
        this._originalWidth = this.width || '500px';
        this._originalHeight = this.height || '300px';
      }

      // Use saved dimensions from previous expand if available
      if (this._currentExpandedWidth && this._currentExpandedHeight) {
        this.el.style.width = this._currentExpandedWidth;
        this.el.style.height = this._currentExpandedHeight;
      } else {
        // Otherwise use original dimensions
        this.el.style.width = this._originalWidth || '500px';
        this.el.style.height = this._originalHeight || '300px';
      }
    }

    this.updateComponentSizing();
  }

  /**
   * Toggles the loadSubcomponents property if the current level of subcomponents is not the total level of subcomponents.
   * Also updates the expanded state of the component.
   */
  private toggleSubcomponents = (event?: Event) => {
    if (!this.hideSubcomponents && this.levelOfSubcomponents - this.currentLevelOfSubcomponents > 0) {
      this.loadSubcomponents = !this.loadSubcomponents;
    }

    // Update expanded state based on details element
    if (event && event.target) {
      const details = (event.target as HTMLElement).closest('details');
      if (details) {
        this.isExpanded = details.open;
        this.updateComponentSizing();
      }
    }
  };

  /**
   * Shows the tooltip of the hovered/focused element.
   * @param event The event that triggered this function.
   */
  private showTooltip = (event: Event) => {
    let target = event.target as HTMLElement;

    // Find the parent A element
    while (target !== null && target.tagName !== 'A') {
      target = target.parentElement as HTMLElement;
    }

    // Find and show the tooltip
    if (target !== null) {
      const tooltip = target.querySelector('[role="tooltip"]');
      if (tooltip) {
        tooltip.classList.remove('hidden');
        // Add ARIA attributes for accessibility
        target.setAttribute('aria-describedby', tooltip.id || 'tooltip');
      }
    }
  };

  /**
   * Hides the tooltip of the hovered/focused element.
   * @param event The event that triggered this function.
   */
  private hideTooltip = (event: Event) => {
    let target = event.target as HTMLElement;

    // Find the parent A element
    while (target !== null && target.tagName !== 'A') {
      target = target.parentElement as HTMLElement;
    }

    // Find and hide the tooltip
    if (target !== null) {
      const tooltip = target.querySelector('[role="tooltip"]');
      if (tooltip) {
        tooltip.classList.add('hidden');
        // Remove ARIA attributes
        target.removeAttribute('aria-describedby');
      }
    }
  };

  /**
   * Parses the value and settings, generates the items and actions and sets the displayStatus to "loaded".
   */
  // Store the filtered items to avoid recalculating on every render
  private _filteredItems: FoldableItem[] = [];

  /**
   * Updates the filtered items based on the current page and amount of items.
   * @private
   */
  private updateFilteredItems(): void {
    this._filteredItems = this.items.filter((_, index) => {
      return index >= this.tablePage * this.amountOfItems && index < this.tablePage * this.amountOfItems + this.amountOfItems;
    });
  }

  @Watch('tablePage')
  onTablePageChange(): void {
    this.updateFilteredItems();
  }

  @Watch('items')
  onItemsChange(): void {
    this.updateFilteredItems();
    // Reset page if we're beyond the available pages
    const maxPage = Math.ceil(this.items.length / this.amountOfItems) - 1;
    if (this.tablePage > maxPage && maxPage >= 0) {
      this.tablePage = maxPage;
    }
  }

  @Watch('amountOfItems')
  validateAmountOfItems(newValue: number): void {
    if (newValue <= 0) {
      console.warn(`pid-component: amountOfItems prop must be positive. Received ${newValue}, defaulting to 10.`);
      this.amountOfItems = 10;
    }
  }

  /**
   * Lifecycle method that is called before the component is loaded.
   * It is used to parse the value and settings, generate the items and actions, and set the displayStatus to "loaded".
   */
  async componentWillLoad() {
    // Validate amountOfItems to prevent division by zero
    this.validateAmountOfItems(this.amountOfItems);

    // Clear items and actions before loading new data to prevent double rendering
    this.items = [];
    this.actions = [];
    let settings: {
      type: string;
      values: {
        name: string;
        value: any;
      }[];
    }[] = [];

    // Robust JSON parsing: handle empty or invalid JSON gracefully
    if (typeof this.settings === 'string' && this.settings.trim().length > 0) {
      try {
        settings = JSON.parse(this.settings);
      } catch (e) {
        console.error('Failed to parse settings.', e);
        settings = [];
      }
    } else {
      settings = [];
    }

    settings.forEach(value => {
      if (!value.values.some(v => v.name === 'ttl')) {
        value.values.push({ name: 'ttl', value: this.defaultTTL });
      }
    });

    // Get the renderer for the value
    try {
      const db = new Database();
      this.identifierObject = await db.getEntity(this.value, settings);
    } catch (e) {
      console.error('Failed to get entity from db', e);
      this.displayStatus = 'error';
      this.identifierObject = undefined;
      this.items = [];
      this.actions = [];
      return;
    }

    // Generate items and actions if subcomponents should be shown
    if (!this.hideSubcomponents) {
      // Deduplicate items using the equals method
      const uniqueItems: FoldableItem[] = [];
      (this.identifierObject?.items || []).forEach(item => {
        if (!uniqueItems.some(existing => item.equals(existing))) {
          uniqueItems.push(item);
        }
      });
      this.items = uniqueItems;
      this.items.sort((a, b) => {
        // Sort by priority defined in the specific implementation of GenericIdentifierType (lower is better)
        if (a.priority > b.priority) return 1;
        if (a.priority < b.priority) return -1;

        // Sort by priority defined by the index in the array of all data types in the parser (lower is better)
        if (a.estimatedTypePriority > b.estimatedTypePriority) return 1;
        if (a.estimatedTypePriority < b.estimatedTypePriority) return -1;

        // If both have same priority, sort by title alphabetically
        if (a.keyTitle && b.keyTitle) {
          return a.keyTitle.localeCompare(b.keyTitle);
        }

        // Return 0 if both items have the same priority and no titles to compare
        return 0;
      });
      // Deduplicate actions using the equals method
      const uniqueActions: FoldableAction[] = [];
      (this.identifierObject?.actions || []).forEach(action => {
        if (!uniqueActions.some(existing => action.equals(existing))) {
          uniqueActions.push(action);
        }
      });
      this.actions = uniqueActions;
      this.actions.sort((a, b) => a.priority - b.priority);
    }
    this.displayStatus = 'loaded';
    console.log('Finished loading for ', this.value, this.identifierObject);
    await clearCache();
  }

  /**
   * Lifecycle method that is called when the component is removed from the DOM.
   * Used for cleanup to prevent memory leaks.
   */
  disconnectedCallback() {
    // Clear references that might cause memory leaks
    this.identifierObject = undefined;
    this.items = [];
    this.actions = [];

    // Remove any dynamically added elements
    const resizeIndicator = this.el.querySelector('.resize-indicator');
    if (resizeIndicator) {
      resizeIndicator.remove();
    }

    // Remove event listeners
    const detailsElement = this.el.querySelector('details');
    if (detailsElement) {
      detailsElement.removeEventListener('toggle', () => this.toggleSubcomponents());
    }

    // Remove resize event listeners if added
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    // Remove any custom styles that were added
    if (this.el.dataset.hasResizeStyle === 'true') {
      const styleElement = Array.from(document.head.querySelectorAll('style')).find(style => style.innerHTML.includes(`#${this.el.id}::before`));
      if (styleElement) {
        styleElement.remove();
      }
    }

    // Cancel any pending operations
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = undefined;
    }
  }

  // AbortController for canceling pending operations
  private _abortController?: AbortController;

  // ResizeObserver for handling component resizing
  private _resizeObserver?: ResizeObserver;

  // Store original dimensions to restore after folding/unfolding
  private _originalWidth: string | null = null;
  private _originalHeight: string | null = null;

  // Store current dimensions for resizing
  private _currentExpandedWidth: string | null = null;
  private _currentExpandedHeight: string | null = null;

  // Store computed line height for collapsed state
  private _lineHeight: number = 24; // Default fallback

  /**
   * Renders the component.
   */
  render() {
    return (
      <Host
        class={`relative ${this.emphasizeComponent ? 'border border-gray-300 rounded-md shadow-sm' : ''} mr-4 float-left
        ${this.isExpanded ? 'mb-4 max-w-full resize-both overflow-auto' : 'my-0 inline-block align-middle overflow-hidden'}
        bg-white font-sans ${this.isExpanded ? 'text-xs' : 'text-sm'}
        ${this.isExpanded ? 'min-w-[500px] min-h-[300px] w-[500px] h-[300px]' : ''}`}
        style={
          !this.isExpanded
            ? {
                height: `${this._lineHeight || 24}px`,
                lineHeight: `${this._lineHeight || 24}px`,
              }
            : {}
        }
      >
        {
          // Check if there are any items or actions to show
          (this.items.length === 0 && this.actions.length === 0) || this.hideSubcomponents ? (
            this.identifierObject !== undefined && this.displayStatus === 'loaded' ? (
              // If loaded but no items available render the preview of the identifier object defined in the specific implementation of GenericIdentifierType
              <span
                class={
                  this.currentLevelOfSubcomponents === 0
                    ? //(w/o sub components)
                      'group ' +
                      (this.emphasizeComponent || this.temporarilyEmphasized ? 'rounded-md shadow border border-gray-300 px-2 py-0 bg-white ' : 'bg-white/60') +
                      ' text-clip inline-flex w-full open:align-top open:w-full ease-in-out transition-all duration-200 overflow-hidden font-bold font-mono cursor-pointer list-none flex-nowrap items-center'
                    : ''
                }
                style={
                  !this.isExpanded
                    ? {
                        height: `${this._lineHeight || 24}px`,
                        lineHeight: `${this._lineHeight || 24}px`,
                      }
                    : {}
                }
                tabIndex={0}
                aria-label="Identifier preview"
              >
                <span
                  class={`font-medium font-mono inline-flex flex-nowrap overflow-hidden text-ellipsis select-all whitespace-nowrap max-w-full ${this.isExpanded ? 'text-xs' : 'text-sm'}`}
                >
                  {// Render the preview of the identifier object defined in the specific implementation of GenericIdentifierType
                  this.identifierObject?.renderPreview()}
                </span>
                {
                  // When this component is on the top level, show the copy button in the summary, in all the other cases show it in the table (implemented farther down)
                  this.currentLevelOfSubcomponents === 0 && this.showTopLevelCopy ? <copy-button value={this.identifierObject.value} class="ml-2 flex-shrink-0" /> : ''
                }
              </span>
            ) : this.displayStatus === 'error' ? (
              <span class={'inline-flex items-center text-red-600 font-medium'}>
                <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-10v6h2V7h-2z" clip-rule="evenodd" />
                </svg>
                Error loading data for: {this.value}
              </span>
            ) : (
              <span class={'inline-flex items-center transition ease-in-out'}>
                <svg class="animate-spin ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Loading indicator">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading... {this.value}
              </span>
            )
          ) : (
            <details
              class="group w-full text-clip font-sans transition-all duration-200 ease-in-out flex flex-col h-full"
              open={this.openByDefault}
              onToggle={this.toggleSubcomponents}
              aria-label="Identifier details section"
            >
              <summary
                class={`font-bold font-mono cursor-pointer list-none flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg marker:hidden ${this.isExpanded ? 'sticky top-0 bg-white z-10 border-b border-gray-100 p-1 overflow-visible' : 'px-0.5 py-0 whitespace-nowrap text-ellipsis overflow-hidden'}`}
                style={
                  !this.isExpanded
                    ? {
                        height: `${this._lineHeight || 24}px`,
                        lineHeight: `${this._lineHeight || 24}px`,
                      }
                    : {}
                }
              >
                <span class={`inline-flex pr-1 items-center ${this.isExpanded ? 'flex-wrap overflow-visible' : 'flex-nowrap overflow-x-auto'}`}>
                  {this.emphasizeComponent || this.temporarilyEmphasized ? (
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
                  ) : (
                    ''
                  )}
                  <span
                    class={`font-medium font-mono inline-flex text-sm select-all ${this.isExpanded ? 'flex-wrap overflow-visible break-words' : 'flex-nowrap overflow-x-auto whitespace-nowrap'}`}
                  >
                    {// Render the preview of the identifier object defined in the specific implementation of GenericIdentifierType
                    this.identifierObject?.renderPreview()}
                  </span>
                </span>
                {
                  // When this component is on the top level, show the copy button in the summary, in all the other cases show it in the table (implemented farther down)
                  this.currentLevelOfSubcomponents === 0 && this.showTopLevelCopy && (this.emphasizeComponent || this.temporarilyEmphasized) ? (
                    <copy-button value={this.identifierObject.value} class="absolute right-2" />
                  ) : (
                    ''
                  )
                }
              </summary>
              {
                // If there are any items to show, render the table
                this.items.length > 0 ? (
                  <Fragment>
                    <div class="rounded-lg border border-gray-200 bg-gray-50 m-1 max-h-[calc(100%-40px)]">
                      {/* Table container with scrollable content */}
                      <div class="overflow-auto max-h-full">
                        <table class="w-full text-left text-sm font-sans select-text border-collapse table-fixed" aria-label="Identifier details">
                          <thead class="bg-slate-600 text-slate-200 rounded-t-lg sticky top-0 z-10">
                            <tr class="font-semibold">
                              <th class="px-2 py-2 min-w-[150px] w-[30%] rounded-tl-lg" scope="col">
                                Key
                              </th>
                              <th class="px-2 py-2 w-[70%] rounded-tr-lg" scope="col">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody class="bg-gray-50">
                            {this._filteredItems.map((value, index) => (
                              <tr
                                key={`item-${value.keyTitle}`}
                                class={`odd:bg-slate-200 even:bg-gray-50 h-7 leading-7 ${index !== this._filteredItems.length - 1 ? 'border-b border-gray-200' : ''}`}
                              >
                                <td class={'p-2 min-w-[150px] w-auto font-mono align-middle'}>
                                  <div class="whitespace-nowrap h-7 leading-7 overflow-hidden text-ellipsis">
                                    <a
                                      role="link"
                                      class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md focus:bg-gray-200 relative md:mt-0 inline flex-nowrap"
                                      onMouseOver={this.showTooltip}
                                      onFocus={this.showTooltip}
                                      onMouseOut={this.hideTooltip}
                                      tabIndex={0}
                                      aria-label={value.keyTitle}
                                    >
                                      <div class="cursor-pointer align-top justify-between flex-nowrap">
                                        <a
                                          href={value.keyLink}
                                          target={'_blank'}
                                          rel={'noopener noreferrer'}
                                          class={'mr-2 text-blue-600 underline hover:text-blue-800 justify-start float-left'}
                                        >
                                          {value.keyTitle}
                                        </a>
                                        <svg
                                          aria-hidden="true"
                                          xmlns="http://www.w3.org/2000/svg"
                                          class="icon icon-tabler icon-tabler-info-circle justify-end min-w-[1rem] min-h-[1rem] flex-none float-right"
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
                                      <p
                                        role="tooltip"
                                        id={`tooltip-${value.keyTitle.replace(/\s+/g, '-').toLowerCase()}`}
                                        class="hidden z-20 mt-1 transition duration-100 ease-in-out shadow-md bg-white rounded text-xs text-gray-600 p-1 flex-wrap overflow-clip"
                                      >
                                        {value.keyTooltip}
                                      </p>
                                    </a>
                                  </div>
                                </td>
                                <td class={'align-top text-sm p-2 w-full select-text relative'}>
                                  <div class="w-full min-h-7 pr-8 flex items-center relative">
                                    <div class="w-full overflow-x-auto whitespace-normal break-words max-h-[200px] overflow-y-auto">
                                      {
                                        // Load a foldable subcomponent if subcomponents are not disabled (hideSubcomponents), and the current level of subcomponents is not the total level of subcomponents. If the subcomponent is on the bottom level of the hierarchy, render just a preview. If the value should not be resolved (isFoldable), just render the value as text.
                                        this.loadSubcomponents && !this.hideSubcomponents && !value.renderDynamically ? (
                                          <pid-component
                                            value={value.value}
                                            levelOfSubcomponents={this.levelOfSubcomponents}
                                            // emphasizeComponent={this.emphasizeComponent}
                                            currentLevelOfSubcomponents={this.currentLevelOfSubcomponents + 1}
                                            amountOfItems={this.amountOfItems}
                                            settings={this.settings}
                                            class="flex-grow"
                                          />
                                        ) : !this.hideSubcomponents && this.currentLevelOfSubcomponents === this.levelOfSubcomponents && !value.renderDynamically ? (
                                          <pid-component
                                            value={value.value}
                                            levelOfSubcomponents={this.currentLevelOfSubcomponents}
                                            // emphasizeComponent={this.emphasizeComponent}
                                            currentLevelOfSubcomponents={this.currentLevelOfSubcomponents}
                                            amountOfItems={this.amountOfItems}
                                            settings={this.settings}
                                            hideSubcomponents={true}
                                            class="flex-grow"
                                          />
                                        ) : (
                                          <span class={'font-mono text-sm overflow-x-auto whitespace-normal break-words inline-block max-w-full'}>{value.value}</span>
                                        )
                                      }
                                    </div>
                                  </div>
                                  <copy-button value={value.value} class="absolute right-0 top-1/2 -translate-y-1/2 flex-shrink-0 z-10 opacity-100 visible" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div class="sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-white px-1 py-1 max-h-10 rounded-b-lg text-xs z-10">
                      <div class="hidden sm:flex sm:flex-1 sm:flex-nowrap sm:items-center sm:justify-between text-sm">
                        <div>
                          <p class="text-xs text-gray-700">
                            Showing
                            <span class="font-medium"> {1 + this.tablePage * this.amountOfItems} </span>
                            to
                            <span class="font-medium"> {Math.min(this.tablePage * this.amountOfItems + this.amountOfItems, this.items.length)} </span>
                            of
                            <span class="font-medium"> {this.items.length} </span>
                            entries
                          </p>
                        </div>
                        <div>
                          {this.items.length > this.amountOfItems ? (
                            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                              <button
                                onClick={() => {
                                  this.tablePage = Math.max(this.tablePage - 1, 0);
                                }}
                                class="relative inline-flex items-center rounded-l-md px-1 py-0.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                                aria-label="Previous page"
                              >
                                <span class="sr-only">Previous</span>
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path
                                    fill-rule="evenodd"
                                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 01-1.06.02z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </button>
                              {Array(Math.ceil(this.items.length / this.amountOfItems))
                                .fill(0)
                                .map((_, index) => {
                                  return (
                                    <button
                                      key={`page-${index}`}
                                      onClick={() => (this.tablePage = index)}
                                      class={
                                        index === this.tablePage
                                          ? 'relative z-10 inline-flex items-center bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                          : 'relative hidden items-center px-2 py-0.5 text-xs font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 md:inline-flex'
                                      }
                                      aria-label={`Page ${index + 1}`}
                                    >
                                      {index + 1}
                                    </button>
                                  );
                                })}
                              <button
                                onClick={() => {
                                  this.tablePage = Math.min(this.tablePage + 1, Math.floor(this.items.length / this.amountOfItems));
                                }}
                                class="relative inline-flex items-center rounded-r-md px-1 py-0.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                                aria-label="Next page"
                              >
                                <span class="sr-only">Next</span>
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path
                                    fill-rule="evenodd"
                                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </button>
                            </nav>
                          ) : (
                            ''
                          )}
                        </div>
                      </div>
                    </div>
                  </Fragment>
                ) : (
                  ''
                )
              }
              {this.identifierObject?.renderBody()}
              {this.actions.length > 0 ? (
                <div class="actions-container sticky bottom-0 bg-white border-t border-gray-200 p-1 z-10 mt-auto">
                  <span class={'flex justify-between gap-1'}>
                    {this.actions.map(action => {
                      let style = 'p-1 font-semibold text-sm rounded border ';
                      switch (action.style) {
                        case 'primary':
                          style += 'bg-blue-500 text-white';
                          break;
                        case 'secondary':
                          style += 'bg-slate-200 text-blue-500';
                          break;
                        case 'danger':
                          style += 'bg-red-500 text-white';
                          break;
                      }

                      return (
                        <a key={`action-${action.title}`} href={action.link} class={style} rel={'noopener noreferrer'} target={'_blank'}>
                          {action.title}
                        </a>
                      );
                    })}
                  </span>
                </div>
              ) : (
                ''
              )}
            </details>
          )
        }
      </Host>
    );
  }
}
