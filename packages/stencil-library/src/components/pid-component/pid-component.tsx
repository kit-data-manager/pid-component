// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, Element, h, Host, Prop, State, Watch } from '@stencil/core';
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
   * The dark mode setting for the component
   * Options: "light", "dark", "system"
   * Default: "system"
   * @type {string}
   */
  @Prop() darkMode: 'light' | 'dark' | 'system' = 'system';

  /**
   * Stores the parsed identifier object.
   */
  @State() identifierObject: GenericIdentifierType;

  /**
   * Tracks the effective dark mode state (true for dark, false for light)
   */
  @State() isDarkMode: boolean = false;

  /**
   * Lists all the items to show in the table.
   */
  @State() items: FoldableItem[] = [];

  // Media query for detecting system dark mode preference
  private darkModeMediaQuery: MediaQueryList;

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
  }

  componentDidLoad() {
    // Initialize component ID for references
    this.ensureComponentId();

    // Ensure collapsible gets proper initial width and open state after load
    // Use a longer delay to ensure DOM is fully rendered before recalculating
    setTimeout(() => {
      const collapsible = this.el.querySelector('pid-collapsible');
      if (collapsible && typeof (collapsible as any).recalculateContentDimensions === 'function') {
        (collapsible as any).recalculateContentDimensions();
      }
    }, 50);
  }

  /**
   * Ensures the component has a unique ID for accessibility references
   */
  private ensureComponentId() {
    if (!this.el.id) {
      this.el.id = `pid-component-${Math.random().toString(36).substring(2, 9)}`;
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

    // After value updates, ensure dimensions are properly recalculated
    setTimeout(() => {
      const collapsible = this.el.querySelector('pid-collapsible');
      if (collapsible && typeof (collapsible as any).recalculateContentDimensions === 'function') {
        (collapsible as any).recalculateContentDimensions();
      }
    }, 10);
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
   * The open state is handled by the pid-collapsible component.
   */
  private toggleSubcomponents = (event?: CustomEvent<boolean>) => {
    // Update open state based on collapsible event
    if (event) {
      // Stop propagation to prevent parent pid-components from collapsing
      event.stopPropagation();

      this.isExpanded = event.detail;

      // Only toggle loadSubcomponents when opening, not when collapsing
      if (event.detail && !this.hideSubcomponents && this.levelOfSubcomponents - this.currentLevelOfSubcomponents > 0) {
        this.loadSubcomponents = true;

        // After loading subcomponents, ensure dimensions are recalculated
        setTimeout(() => {
          const collapsible = this.el.querySelector('pid-collapsible');
          if (collapsible && typeof (collapsible as any).recalculateContentDimensions === 'function') {
            (collapsible as any).recalculateContentDimensions();
          }
        }, 50); // Give it a bit more time for the DOM to update with new content
      }
    }
  };

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
   * Watch for changes in the darkMode property
   */
  @Watch('darkMode')
  watchDarkMode() {
    // Update component's internal dark mode state
    this.updateDarkMode();

    // Update darkMode setting in the identifierObject if it exists
    if (this.identifierObject) {
      // Get current settings from the identifierObject
      const currentSettings = this.identifierObject.settings || [];

      // Update or add darkMode setting
      const darkModeIndex = currentSettings.findIndex(s => s.name === 'darkMode');
      if (darkModeIndex >= 0) {
        currentSettings[darkModeIndex].value = this.darkMode;
      } else {
        currentSettings.push({ name: 'darkMode', value: this.darkMode });
      }

      // Update settings in the identifierObject
      this.identifierObject.settings = currentSettings;
    }
  }

  /**
   * Lifecycle method that is called before the component is loaded.
   * It is used to parse the value and settings, generate the items and actions, and set the displayStatus to "loaded".
   */
  async componentWillLoad() {
    // Ensure component has an ID for accessibility references
    this.ensureComponentId();

    // Validate amountOfItems to prevent division by zero
    this.validateAmountOfItems(this.amountOfItems);

    // Initialize dark mode
    this.initializeDarkMode();

    // Clear items and actions before loading new data to prevent double rendering
    this.items = [];
    this.actions = [];
    let settings: {
      type: string;
      values: {
        name: string;
        value: unknown;
      }[];
    }[];

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

    // If settings array is empty, create a default settings entry
    if (settings.length === 0) {
      settings.push({
        type: 'default',
        values: [
          { name: 'ttl', value: this.defaultTTL },
          { name: 'darkMode', value: this.darkMode },
        ],
      });
    } else {
      // Update existing settings
      settings.forEach(value => {
        // Add TTL setting if not present
        if (!value.values.some(v => v.name === 'ttl')) {
          value.values.push({ name: 'ttl', value: this.defaultTTL });
        }

        // Add or update darkMode setting
        const darkModeIndex = value.values.findIndex(v => v.name === 'darkMode');
        if (darkModeIndex >= 0) {
          value.values[darkModeIndex].value = this.darkMode;
        } else {
          value.values.push({ name: 'darkMode', value: this.darkMode });
        }
      });
    }

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

    // Clean up dark mode media query listener
    this.cleanupDarkModeListener();
  }

  // AbortController for canceling pending operations
  private _abortController?: AbortController;

  // Store computed line height for collapsed state
  private _lineHeight: number = 24; // Default fallback

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
   * Determines if footer should be shown based on whether there are actions or items with pagination
   */
  private get shouldShowFooter(): boolean {
    const hasActions = this.actions.length > 0;
    const hasPagination = this.items.length > this.amountOfItems;
    return hasActions || hasPagination;
  }

  /**
   * Renders the component.
   */
  render() {
    // Set initial expanded state based on openByDefault
    if (this.openByDefault) {
      if (!this.hideSubcomponents && this.levelOfSubcomponents - this.currentLevelOfSubcomponents > 0) {
        this.isExpanded = this.openByDefault;
        this.loadSubcomponents = true;

        // After loading subcomponents, ensure dimensions are recalculated
        setTimeout(() => {
          const collapsible = this.el.querySelector('pid-collapsible');
          if (collapsible && typeof (collapsible as any).recalculateContentDimensions === 'function') {
            (collapsible as any).recalculateContentDimensions();
          }
          console.log(
            `Loaded subcomponents and recalculated dimensions. expanded: ${this.isExpanded}, loadSubcomponents: ${this.loadSubcomponents}, currentLevel: ${this.currentLevelOfSubcomponents}, totalLevels: ${this.levelOfSubcomponents}`,
          );
        }, 50); // Give it a bit more time for the DOM to update with new content
      }
    }

    return (
      <Host class={`relative font-sans`}>
        {/* Hidden description for accessibility */}
        <span id={`${this.el.id}-description`} class="sr-only">
          This component displays information about the identifier {this.value}. It can be expanded to show more details.
        </span>
        {
          // Check if there are any items or actions to show, or if there's a body to render
          (this.items.length === 0 && this.actions.length === 0 && !this.identifierObject?.renderBody()) || this.hideSubcomponents ? (
            this.identifierObject !== undefined && this.displayStatus === 'loaded' ? (
              // If loaded but no items available render the preview of the identifier object defined in the specific implementation of GenericIdentifierType
              <span
                class={
                  this.currentLevelOfSubcomponents === 0
                    ? //(w/o sub components)
                      'group rounded-md border px-2 py-0 shadow-sm' +
                      (this.emphasizeComponent || this.temporarilyEmphasized
                        ? this.isDarkMode
                          ? 'border-gray-600 bg-gray-800'
                          : 'border-gray-300 bg-white'
                        : this.isDarkMode
                          ? 'bg-gray-800/60'
                          : 'bg-white/60') +
                      ' inline-flex w-full cursor-pointer list-none flex-nowrap items-center overflow-hidden font-mono font-bold text-clip transition-all duration-200 ease-in-out open:w-full open:align-top' +
                      (!this.isExpanded ? ` h-[${this._lineHeight || 24}px] leading-[${this._lineHeight || 24}px]` : '')
                    : ''
                }
                tabIndex={0}
                role="button"
                aria-label={`Identifier preview for ${this.value}`}
                aria-expanded={this.isExpanded}
              >
                <span
                  class={`inline-flex max-w-full flex-nowrap overflow-x-auto font-mono font-medium text-ellipsis whitespace-nowrap select-all ${this.isExpanded ? 'text-xs' : 'text-sm'}`}
                >
                  {// Render the preview of the identifier object defined in the specific implementation of GenericIdentifierType
                  this.identifierObject?.renderPreview()}
                </span>
                {
                  // When this component is on the top level, show the copy button in the summary, in all the other cases show it in the table (implemented farther down)
                  this.currentLevelOfSubcomponents === 0 && this.showTopLevelCopy ? (
                    <copy-button value={this.identifierObject.value} class="ml-2 shrink-0" aria-label={`Copy value: ${this.identifierObject.value}`} />
                  ) : (
                    ''
                  )
                }
              </span>
            ) : this.displayStatus === 'error' ? (
              <span class={'inline-flex items-center font-medium text-red-600'} role="alert" aria-live="assertive">
                <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-10v6h2V7h-2z" clip-rule="evenodd" />
                </svg>
                Error loading data for: {this.value}
              </span>
            ) : (
              <span class={'inline-flex items-center transition ease-in-out'} role="status" aria-live="polite">
                <svg class="mr-3 ml-1 h-5 w-5 animate-spin text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading... {this.value}</span>
              </span>
            )
          ) : (
            <pid-collapsible
              open={this.isExpanded}
              emphasize={this.emphasizeComponent || this.temporarilyEmphasized}
              initialWidth={this.width}
              initialHeight={this.height}
              lineHeight={this._lineHeight}
              showFooter={this.shouldShowFooter}
              darkMode={this.darkMode}
              onCollapsibleToggle={e => this.toggleSubcomponents(e)}
              onClick={e => {
                // Isolate click events to prevent bubbling to parent components
                e.stopPropagation();
                e.stopImmediatePropagation();
              }}
              aria-label={`Collapsible section for ${this.value}`}
              aria-describedby={`${this.el.id}-description`}
            >
              <span
                slot="summary"
                class={`inline-flex items-center overflow-x-auto font-mono text-sm font-medium select-all ${this.isExpanded ? 'flex-wrap overflow-visible wrap-break-word' : 'flex-nowrap whitespace-nowrap'}`}
                aria-label={`Preview of ${this.value}`}
              >
                {this.identifierObject?.renderPreview()}
              </span>

              {this.currentLevelOfSubcomponents === 0 && this.showTopLevelCopy && (this.emphasizeComponent || this.temporarilyEmphasized) ? (
                <copy-button
                  slot="summary-actions"
                  value={this.value}
                  // class="relative my-auto ml-auto shrink-0"
                  aria-label={`Copy value: ${this.value}`}
                />
              ) : null}

              {/* Table and content */}
              {this.items.length > 0 ? (
                <pid-data-table
                  items={this.items}
                  itemsPerPage={this.amountOfItems}
                  currentPage={this.tablePage}
                  loadSubcomponents={this.loadSubcomponents}
                  hideSubcomponents={this.hideSubcomponents}
                  currentLevelOfSubcomponents={this.currentLevelOfSubcomponents}
                  levelOfSubcomponents={this.levelOfSubcomponents}
                  settings={this.settings}
                  darkMode={this.darkMode}
                  onPageChange={e => (this.tablePage = e.detail)}
                  class="w-full grow overflow-auto"
                  aria-label={`Data table for ${this.value}`}
                  aria-describedby={`${this.el.id}-table-description`}
                />
              ) : null}

              {/* Hidden description for data table accessibility */}
              {this.items.length > 0 && (
                <span id={`${this.el.id}-table-description`} class="sr-only">
                  This table displays properties and values associated with the identifier {this.value}.
                </span>
              )}

              {this.identifierObject?.renderBody()}

              {/* Pagination in a separate line above actions */}
              {this.items.length > 0 && (
                <div slot="footer" class={`relative z-50 w-full overflow-visible ${this.isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <pid-pagination
                    currentPage={this.tablePage}
                    totalItems={this.items.length}
                    itemsPerPage={this.amountOfItems}
                    darkMode={this.darkMode}
                    onPageChange={e => (this.tablePage = e.detail)}
                    onItemsPerPageChange={e => (this.amountOfItems = e.detail)}
                    aria-label={`Pagination controls for ${this.value} data`}
                    aria-controls={`${this.el.id}-table`}
                  />
                </div>
              )}

              {/* Footer Actions - in a separate line below pagination */}
              {this.actions.length > 0 && (
                <pid-actions slot="footer-actions" actions={this.actions} darkMode={this.darkMode} class="my-0 shrink-0" aria-label={`Available actions for ${this.value}`} />
              )}
            </pid-collapsible>
          )
        }
      </Host>
    );
  }
}
