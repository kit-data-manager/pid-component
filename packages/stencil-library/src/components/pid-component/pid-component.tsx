import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, State, Watch } from '@stencil/core';
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
   * Enable adaptive pagination based on available space.
   * When true, amountOfItems becomes the initial value that can be unrestricted changed by the user.
   * @type {boolean}
   */
  @Prop() adaptivePagination: boolean = false;

  /**
   * Event emitted when the collapsible is toggled (expanded/collapsed).
   * This event is emitted with a boolean value indicating whether the component is expanded (true) or collapsed (false).
   * @event collapsibleToggle
   */
  @Event() collapsibleToggle: EventEmitter<boolean>;

  /**
   * Estimated height of each table row in pixels (used for adaptive pagination).
   * This is used as a fallback when no actual measurements are available.
   * @type {number}
   */
  @Prop() estimatedRowHeight: number = 40;

  /**
   * Actual measured average row height (updated dynamically)
   */
  @State() measuredRowHeight: number = 0;

  /**
   * Updates the component sizing and styling based on the expanded state
   * This method is now handled by the pid-collapsible component
   */
  @Method()
  async updateComponentSizing() {
    // This method is kept for backward compatibility
    console.log('updateComponentSizing is now handled by the pid-collapsible component');
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

  /**
   * Tracks calculated items per page for adaptive pagination
   */
  @State() calculatedItemsPerPage: number = 10;

  constructor() {
    this.temporarilyEmphasized = this.emphasizeComponent;
    this.isExpanded = this.openByDefault || false;
  }

  componentDidLoad() {
    // // Add clear-after to prevent text from flowing under the component
    // this.el.classList.add('after:content-[""]', 'after:block', 'after:clear-both');

    // Initialize component ID for references
    if (!this.el.id) {
      this.el.id = `pid-component-${Math.random().toString(36).substr(2, 9)}`;
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
    // Update expanded state based on openByDefault
    this.isExpanded = this.openByDefault;
  }

  /**
   * Toggles the loadSubcomponents property if the current level of subcomponents is not the total level of subcomponents.
   * The expanded state is now handled by the pid-collapsible component.
   */
  private toggleSubcomponents = (event?: CustomEvent<boolean>) => {
    // Update expanded state based on collapsible event
    if (event) {
      // Stop propagation to prevent parent pid-components from collapsing
      event.stopPropagation();

      this.isExpanded = event.detail;

      // Only toggle loadSubcomponents when expanding, not when collapsing
      if (event.detail && !this.hideSubcomponents && this.levelOfSubcomponents - this.currentLevelOfSubcomponents > 0) {
        this.loadSubcomponents = true;
      }

      // Emit the collapsibleToggle event to notify parent components
      this.collapsibleToggle.emit(event.detail);
    }
  };

  // Tooltip functionality has been moved to the pid-tooltip component

  /**
   * Parses the value and settings, generates the items and actions and sets the displayStatus to "loaded".
   */

  @Watch('items')
  onItemsChange(): void {
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

    // Initialize calculated items per page
    // In adaptive mode, amountOfItems becomes the initial value
    // but will be adjusted based on available space
    this.calculatedItemsPerPage = this.amountOfItems;

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

    // Cancel any pending operations
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = undefined;
    }
  }

  // AbortController for canceling pending operations
  private _abortController?: AbortController;

  // Store computed line height for collapsed state
  private _lineHeight: number = 24; // Default fallback

  /**
   * Calculates the optimal number of items per page based on available height
   */
  private calculateOptimalItemsPerPage = (availableHeight: number): number => {
    if (!this.adaptivePagination) {
      return this.amountOfItems;
    }

    // Reserve space for header, footer, padding
    const headerHeight = 44; // Table header height
    const footerHeight = this.shouldShowFooter ? 120 : 0; // Footer with pagination
    const padding = 40; // Container padding (increased to account for borders, margins)

    // Calculate available height for table rows
    const availableTableHeight = Math.max(0, availableHeight - headerHeight - footerHeight - padding);

    // Use measured row height if available, otherwise fall back to estimated height
    const rowHeight = this.measuredRowHeight > 0 ? this.measuredRowHeight : this.estimatedRowHeight;

    // Calculate how many items can fit in the available space
    const maxItems = Math.floor(availableTableHeight / rowHeight);

    // Return the calculated number of items without constraints
    // This allows unrestricted resizing based on available space
    return Math.max(1, maxItems);
  };

  /**
   * Handles row height changes from the data table
   */
  // Debounce timer to prevent rapid successive updates
  private rowHeightDebounceTimer: any = null;
  // Flag to prevent recursive updates
  private isUpdatingFromRowHeights: boolean = false;

  private handleRowHeightsChange = (event: CustomEvent<{ totalHeight: number; averageHeight: number }>) => {
    // Prevent processing if we're already updating from a row height change
    if (this.isUpdatingFromRowHeights) return;

    // Only update if the height has changed significantly (more than 5%)
    const heightDifference = Math.abs(this.measuredRowHeight - event.detail.averageHeight);
    const significantChange = this.measuredRowHeight === 0 || heightDifference / this.measuredRowHeight > 0.05;

    // Update the measured row height if it's valid and has changed significantly
    if (event.detail.averageHeight > 0 && significantChange) {
      // Clear any existing debounce timer
      if (this.rowHeightDebounceTimer) {
        clearTimeout(this.rowHeightDebounceTimer);
      }

      // Debounce the update to prevent rapid successive updates
      this.rowHeightDebounceTimer = setTimeout(() => {
        this.isUpdatingFromRowHeights = true;

        // Update the measured row height
        this.measuredRowHeight = event.detail.averageHeight;

        // Recalculate items per page if expanded
        if (this.adaptivePagination && this.isExpanded) {
          const el = this.el.querySelector('pid-collapsible');
          if (el) {
            const rect = el.getBoundingClientRect();
            const newItemsPerPage = this.calculateOptimalItemsPerPage(rect.height);

            // Only update if the change is significant (more than 1 item difference)
            if (Math.abs(newItemsPerPage - this.calculatedItemsPerPage) > 1) {
              const previousItemsPerPage = this.calculatedItemsPerPage;
              this.calculatedItemsPerPage = newItemsPerPage;

              // Adjust page to maintain position
              const currentTopItemIndex = this.tablePage * previousItemsPerPage;
              const newPage = Math.floor(currentTopItemIndex / newItemsPerPage);

              if (newPage !== this.tablePage) {
                this.tablePage = newPage;
              }

              console.log(`Adaptive pagination: Updated based on measured row height (${this.measuredRowHeight}px), showing ${newItemsPerPage} items per page`);
            }
          }
        }

        // Reset the update flag after a short delay
        setTimeout(() => {
          this.isUpdatingFromRowHeights = false;
        }, 50);
      }, 200); // Debounce for 200ms
    }
  };

  /**
   * Handles resize events from collapsible component
   */
  // Debounce timer for resize events
  private resizeDebounceTimer: any = null;
  // Flag to prevent recursive updates
  private isUpdatingFromResize: boolean = false;

  private handleCollapsibleResize = (event: CustomEvent<{ width: number; height: number }>) => {
    // Prevent processing if we're already updating from a resize event
    // or if we're updating from row heights to avoid conflicts
    if (this.isUpdatingFromResize || this.isUpdatingFromRowHeights) return;

    // Only process if we're in adaptive pagination mode, expanded, and have a valid height
    if (this.adaptivePagination && this.isExpanded && event.detail.height > 0) {
      // Clear any existing debounce timer
      if (this.resizeDebounceTimer) {
        clearTimeout(this.resizeDebounceTimer);
      }

      // Debounce the resize handling to prevent rapid successive updates
      this.resizeDebounceTimer = setTimeout(() => {
        this.isUpdatingFromResize = true;

        // Calculate new optimal items per page based on available height
        const newItemsPerPage = this.calculateOptimalItemsPerPage(event.detail.height);

        // Only update if the change is significant (more than 1 item difference)
        // This prevents minor fluctuations from causing unnecessary updates
        if (Math.abs(newItemsPerPage - this.calculatedItemsPerPage) > 1) {
          const previousItemsPerPage = this.calculatedItemsPerPage;
          this.calculatedItemsPerPage = newItemsPerPage;

          // Calculate current position in the data
          const currentTopItemIndex = this.tablePage * previousItemsPerPage;

          // Determine new page to keep the view position as consistent as possible
          if (newItemsPerPage !== previousItemsPerPage) {
            // Calculate new page that would show the same top item
            const newPage = Math.floor(currentTopItemIndex / newItemsPerPage);

            // Only change page if necessary
            if (newPage !== this.tablePage) {
              this.tablePage = newPage;
            }
          }

          console.log(`Adaptive pagination: Resized to ${event.detail.width}x${event.detail.height}, showing ${newItemsPerPage} items per page`);
        }

        // Reset the update flag after a short delay
        setTimeout(() => {
          this.isUpdatingFromResize = false;
        }, 50);
      }, 200); // Debounce for 200ms
    }
  };

  /**
   * Determines if footer should be shown based on whether there are actions or items with pagination
   */
  private get shouldShowFooter(): boolean {
    const hasActions = this.actions.length > 0;

    // In adaptive mode, we need pagination if items exceed the calculated amount
    // In fixed mode, we need pagination if items exceed the configured amount
    const effectiveItemsPerPage = this.adaptivePagination ? this.calculatedItemsPerPage : this.amountOfItems;
    const hasPagination = this.items.length > effectiveItemsPerPage;

    // Always show footer in adaptive mode when there are items to paginate
    // This ensures the pagination controls are always available even when all items fit
    const needsAdaptiveControls = this.adaptivePagination && this.items.length > 1;

    return hasActions || hasPagination || needsAdaptiveControls;
  }

  /**
   * Renders the component.
   */
  render() {
    // Determine effective items per page based on adaptive pagination mode
    const effectiveItemsPerPage = this.adaptivePagination ? this.calculatedItemsPerPage : this.amountOfItems;

    return (
      <Host class="relative font-sans">
        {
          // Check if there are any items or actions to show, or if there's a body to render
          (this.items.length === 0 && this.actions.length === 0 && !this.identifierObject?.renderBody()) || this.hideSubcomponents ? (
            this.identifierObject !== undefined && this.displayStatus === 'loaded' ? (
              // If loaded but no items available render the preview of the identifier object defined in the specific implementation of GenericIdentifierType
              <span
                class={
                  this.currentLevelOfSubcomponents === 0
                    ? //(w/o sub components)
                      'group ' +
                      (this.emphasizeComponent || this.temporarilyEmphasized ? 'rounded-md shadow border border-gray-300 px-2 py-0 bg-white ' : 'bg-white/60') +
                      ' text-clip inline-flex w-full open:align-top open:w-full ease-in-out transition-all duration-200 overflow-hidden font-bold font-mono cursor-pointer list-none flex-nowrap items-center' +
                      (!this.isExpanded ? ` h-[${this._lineHeight || 24}px] leading-[${this._lineHeight || 24}px]` : '')
                    : ''
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
            <pid-collapsible
              open={this.openByDefault}
              emphasize={this.emphasizeComponent || this.temporarilyEmphasized}
              expanded={this.isExpanded}
              initialWidth={this.width}
              initialHeight={this.height}
              lineHeight={this._lineHeight}
              showFooter={this.shouldShowFooter}
              adaptivePagination={this.adaptivePagination}
              onCollapsibleToggle={e => this.toggleSubcomponents(e)}
              onCollapsibleResize={this.handleCollapsibleResize}
              onClick={e => {
                // Isolate click events to prevent bubbling to parent components
                e.stopPropagation();
                e.stopImmediatePropagation();
              }}
            >
              <span
                slot="summary"
                class={`font-medium font-mono inline-flex text-sm select-all ${this.isExpanded ? 'flex-wrap overflow-visible break-words' : 'flex-nowrap overflow-x-auto whitespace-nowrap'}`}
              >
                {this.identifierObject?.renderPreview()}
              </span>

              {this.currentLevelOfSubcomponents === 0 && this.showTopLevelCopy && (this.emphasizeComponent || this.temporarilyEmphasized) ? (
                <copy-button slot="summary-actions" value={this.value} class="relative ml-auto flex-shrink-0" />
              ) : null}

              {/* Table and content */}
              {this.items.length > 0 ? (
                <pid-data-table
                  items={this.items}
                  itemsPerPage={effectiveItemsPerPage}
                  currentPage={this.tablePage}
                  loadSubcomponents={this.loadSubcomponents}
                  hideSubcomponents={this.hideSubcomponents}
                  currentLevelOfSubcomponents={this.currentLevelOfSubcomponents}
                  levelOfSubcomponents={this.levelOfSubcomponents}
                  settings={this.settings}
                  adaptivePagination={this.adaptivePagination}
                  estimatedRowHeight={this.estimatedRowHeight}
                  onPageChange={e => (this.tablePage = e.detail)}
                  onRowHeightsChange={this.handleRowHeightsChange}
                  class={this.adaptivePagination ? 'flex-grow overflow-hidden' : 'flex-grow overflow-auto'}
                />
              ) : null}

              {this.identifierObject?.renderBody()}

              {/* Pagination in a separate line above actions */}
              {this.items.length > 0 && (
                <div slot="footer" class="relative w-full bg-white z-50 overflow-visible">
                  <pid-pagination
                    currentPage={this.tablePage}
                    totalItems={this.items.length}
                    itemsPerPage={effectiveItemsPerPage}
                    onPageChange={e => (this.tablePage = e.detail)}
                    onItemsPerPageChange={e => {
                      if (this.adaptivePagination) {
                        // In adaptive mode, update calculatedItemsPerPage directly
                        // This allows users to change the number of items per page after initialization
                        this.calculatedItemsPerPage = e.detail;
                      } else {
                        this.amountOfItems = e.detail;
                      }
                    }}
                    adaptivePagination={this.adaptivePagination}
                    showItemsPerPageControl={true}
                  />
                </div>
              )}

              {/* Footer Actions - in a separate line below pagination */}
              {this.actions.length > 0 && <pid-actions slot="footer-actions" actions={this.actions} class="flex-shrink-0 mt-0" />}
            </pid-collapsible>
          )
        }
      </Host>
    );
  }
}
