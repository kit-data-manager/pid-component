import { Component, h, Host, Prop, State, Watch } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';
import { clearEntities, getEntity } from '../../utils/IndexedDBUtil';
import { clearCache } from '../../utils/DataCache';

@Component({
  tag: 'pid-component',
  styleUrl: 'pid-component.css',
  shadow: false,
})
export class PidComponent {
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
  @Prop() settings: string;

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
   * If this flag is set to true, the component will reset the cache and database on every load and disconnect.
   * Already existing data will be deleted.
   */
  @Prop() doNotCacheOrStoreInDatabase: boolean = false;

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
  @State() temporarilyEmphasized: boolean = this.emphasizeComponent;

  /**
   * Watches the value property and calls connectedCallback() if it changes.
   * This is important for the different pages inside the table, since the magic-display components are not rerendered by default on value or state change.
   */
  @Watch('value')
  async watchValue() {
    this.displayStatus = 'loading';
    // this.identifierObject = undefined;
    await this.connectedCallback();
  }

  /**
   * Watches the loadSubcomponents property and sets the temporarilyEmphasized property to the value of loadSubcomponents.
   */
  @Watch('loadSubcomponents')
  async watchLoadSubcomponents() {
    this.temporarilyEmphasized = this.loadSubcomponents;
  }

  /**
   * Parses the value and settings, generates the items and actions and sets the displayStatus to "loaded".
   */
  async connectedCallback() {
    if (this.doNotCacheOrStoreInDatabase) {
      console.log('Clearing cache and database for ', this.value);
      clearCache();
      clearEntities();
    }

    let settings: {
      type: string;
      values: {
        name: string;
        value: any;
      }[];
    }[];

    try {
      settings = JSON.parse(this.settings);
    } catch (e) {
      console.error('Failed to parse settings.', e);
    }
    settings.forEach(value => {
      if (!value.values.some(v => v.name === 'ttl')) {
        value.values.push({ name: 'ttl', value: this.defaultTTL });
      }
    });

    // Get the renderer for the value
    await getEntity(this.value, settings).then(renderer => {
      this.identifierObject = renderer;
    });

    // Generate items and actions if subcomponents should be shown
    if (!this.hideSubcomponents) {
      this.items = this.identifierObject.items;
      this.items.sort((a, b) => {
        // Sort by priority defined in the specific implementation of GenericIdentifierType (lower is better)
        if (a.priority > b.priority) return 1;
        if (a.priority < b.priority) return -1;

        // Sort by priority defined by the index in the array of all data types in the parser (lower is better)
        if (a.estimatedTypePriority > b.estimatedTypePriority) return 1;
        if (a.estimatedTypePriority < b.estimatedTypePriority) return -1;
      });

      this.actions = this.identifierObject.actions;
      this.actions.sort((a, b) => a.priority - b.priority);
    }
    this.displayStatus = 'loaded';
    console.log('Finished loading for ', this.value, this.identifierObject);
    await clearCache();
  }

  /**
   * Renders the component.
   */
  render() {
    return (
      <Host class="inline flex-grow max-w-full font-sans flex-wrap align-baseline items-center text-xs dark:text-white">
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
                      (this.emphasizeComponent || this.temporarilyEmphasized ? 'rounded-md shadow-md border px-1 bg-white dark:bg-gray-800' : 'bg-white/40 dark:bg-gray-800/40') +
                      'text-xs text-clip inline-flex flex-grow open:align-top open:w-full ease-in-out transition-all duration-200 overflow-y-hidden font-bold font-mono cursor-pointer list-none overflow-x-hidden space-x-3 flex-nowrap flex-shrink-0 items-center'
                    : ''
                }
              >
                <span class={'font-medium font-mono inline-flex flex-nowrap overflow-x-auto text-xs select-none'}>
                  {
                    // Render the preview of the identifier object defined in the specific implementation of GenericIdentifierType
                    this.identifierObject.renderPreview()
                  }
                </span>
                {
                  // When this component is on the top level, show the copy button in the summary, in all the other cases show it in the table (implemented farther down)
                  this.currentLevelOfSubcomponents === 0 && this.showTopLevelCopy && this.emphasizeComponent ? <copy-button value={this.identifierObject.value} /> : ''
                }
              </span>
            ) : (
              <span class={'inline-flex items-center transition ease-in-out'}>
                <svg class="animate-spin ml-1 mr-3 h-5 w-5 text-black dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25 dark:opacity-75" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
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
              class={
                'group ' +
                (this.emphasizeComponent || this.temporarilyEmphasized ? 'bg-white dark:bg-gray-800 rounded-md border pl-0.5 py-0' : 'bg-white/60 dark:bg-gray-800/60') +
                'text-clip inline flex-grow font-sans open:align-top open:w-full ease-in-out transition-all duration-200'
              }
              open={this.openByDefault}
              onToggle={this.toggleSubcomponents}
            >
              <summary class="overflow-y-hidden font-bold font-mono cursor-pointer list-none overflow-x-hidden inline-flex flex-nowrap flex-shrink-0 items-center">
                <span class={'inline-flex flex-nowrap overflow-x-auto pr-1 items-center'}>
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
                      >
                        <path d="M 2 3 l 4 6 l 4 -6"></path>
                      </svg>
                    </span>
                  ) : (
                    ''
                  )}
                  <span class={'font-medium font-mono inline-flex flex-nowrap overflow-x-auto text-sm select-none'}>
                    {
                      // Render the preview of the identifier object defined in the specific implementation of GenericIdentifierType
                      this.identifierObject.renderPreview()
                    }
                  </span>
                </span>
                {
                  // When this component is on the top level, show the copy button in the summary, in all the other cases show it in the table (implemented farther down)
                  this.currentLevelOfSubcomponents === 0 && this.showTopLevelCopy && (this.emphasizeComponent || this.temporarilyEmphasized) ? (
                    <copy-button value={this.identifierObject.value} />
                  ) : (
                    ''
                  )
                }
              </summary>
              {
                // If there are any items to show, render the table
                this.items.length > 0 ? (
                  <div>
                    <div class="resize-y divide-y text-sm leading-6 bg-gray-100 dark:bg-gray-900 m-1 p-0.5 h-64 max-h-fit overflow-y-scroll border rounded min-h-[4rem]">
                      <table class="text-left w-full text-sm font-sans select-text">
                        <tbody class="bg-grey-100 dark:bg-gray-900 flex flex-col items-center justify-between overflow-y-scroll w-full rounded-b">
                          {this.items
                            .filter((_, index) => {
                              // Filter out items that are not on the current page
                              return index >= this.tablePage * this.amountOfItems && index < this.tablePage * this.amountOfItems + this.amountOfItems;
                            })
                            .map(value => (
                              // Render a row for every item
                              // return (
                              <tr class={'odd:bg-slate-200 dark:odd:bg-slate-800 flex w-full'}>
                                <td class={'overflow-x-auto p-1 w-1/6 font-mono'}>
                                  <a
                                    role="link"
                                    class="right-0 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-700 rounded-md focus:ring-offset-2 focus:ring-2 focus:bg-gray-200 dark:focus:bg-gray-800 relative md:mt-0 inline flex-nowrap"
                                    onMouseOver={this.showTooltip}
                                    onFocus={this.showTooltip}
                                    onMouseOut={this.hideTooltip}
                                  >
                                    <div class="cursor-pointer align-top justify-between flex-nowrap">
                                      <a href={value.keyLink} target={'_blank'} rel={'noopener noreferrer'} class={'mr-2 text-blue-500 justify-start float-left'}>
                                        {value.keyTitle}
                                      </a>
                                      <svg
                                        aria-haspopup="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="icon icon-tabler icon-tabler-info-circle justify-end min-w-[1rem] min-h-[1rem] flex-none float-right"
                                        width="25"
                                        height="25"
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
                                      class="hidden z-20 mt-1 transition duration-100 ease-in-out shadow-md bg-white dark:bg-gray-800 rounded text-xs text-gray-500 p-1 flex-wrap overflow-clip"
                                    >
                                      {value.keyTooltip}
                                    </p>
                                  </a>
                                </td>
                                <td class={'align-top overflow-x-auto text-sm p-1 w-5/6 select-text flex '}>
                                  <span class={'flex-grow'}>
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
                                        />
                                      ) : (
                                        <span class={'font-mono text-sm'}>{value.value}</span>
                                      )
                                    }
                                  </span>
                                  <copy-button value={value.value} />
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-1 py-1 sm:px-1 max-h-12">
                      <div class="hidden sm:flex sm:flex-1 sm:flex-nowrap sm:items-center sm:justify-between text-sm">
                        <div class={''}>
                          <p class="text-sm text-gray-700 dark:text-gray-300">
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
                                class="fill-current relative inline-flex items-center rounded-l-md px-1 py-1 text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-950 focus:z-20 focus:outline-offset-0"
                              >
                                <span class="sr-only">Previous</span>
                                <svg class="h-5 w-5" viewBox="0 0 20 20" aria-hidden="true">
                                  <path
                                    fill-rule="evenodd"
                                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </button>
                              {Array(Math.ceil(this.items.length / this.amountOfItems))
                                .fill(0)
                                .map((_, index) => {
                                  return (
                                    <button
                                      onClick={() => (this.tablePage = index)}
                                      class={
                                        index === this.tablePage
                                          ? 'relative z-10 inline-flex items-center bg-blue-500 px-2 py-1 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
                                          : 'relative hidden items-center px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-950 focus:z-20 focus:outline-offset-0 md:inline-flex'
                                      }
                                    >
                                      {index + 1}
                                    </button>
                                  );
                                })}
                              <button
                                onClick={() => {
                                  this.tablePage = Math.min(this.tablePage + 1, Math.floor(this.items.length / this.amountOfItems));
                                }}
                                class="fill-current relative inline-flex items-center rounded-r-md px-1 py-1 text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-950 focus:z-20 focus:outline-offset-0"
                              >
                                <span class="sr-only">Next</span>
                                <svg class="h-5 w-5" viewBox="0 0 20 20" aria-hidden="true">
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
                  </div>
                ) : (
                  ''
                )
              }
              {this.identifierObject.renderBody()}
              {this.actions.length > 0 ? (
                <span class={'m-0.5 flex justify-between gap-1'}>
                  {this.actions.map(action => {
                    let style = 'p-1 font-semibold text-sm rounded border ';
                    switch (action.style) {
                      case 'primary':
                        style += 'bg-blue-500 text-white';
                        break;
                      case 'secondary':
                        style += 'bg-slate-200 dark:bg-slate-800 text-blue-500';
                        break;
                      case 'danger':
                        style += 'bg-red-500 text-white';
                        break;
                    }

                    return (
                      <a href={action.link} class={style} rel={'noopener noreferrer'} target={'_blank'}>
                        {action.title}
                      </a>
                    );
                  })}
                </span>
              ) : (
                ''
              )}
            </details>
          )
        }
      </Host>
    );
  }

  disconnectedCallback() {
    console.log('Disconnected callback for ', this.value);
    if (this.doNotCacheOrStoreInDatabase) {
      console.log('Clearing cache and database for ', this.value);
      clearCache();
      clearEntities();
    }
  }

  /**
   * Toggles the loadSubcomponents property if the current level of subcomponents is not the total level of subcomponents.
   */
  private toggleSubcomponents = () => {
    if (!this.hideSubcomponents && this.levelOfSubcomponents - this.currentLevelOfSubcomponents > 0) this.loadSubcomponents = !this.loadSubcomponents;
  };

  /**
   * Shows the tooltip of the hovered element.
   * @param event The event that triggered this function.
   */
  private showTooltip = (event: Event) => {
    let target = event.target as HTMLElement;
    do {
      target = target.parentElement as HTMLElement;
    } while (target !== null && target.tagName !== 'A');
    if (target !== null) target.children[1].classList.remove('hidden');
  };

  /**
   * Hides the tooltip of the hovered element.
   * @param event The event that triggered this function.
   */
  private hideTooltip = (event: Event) => {
    let target = event.target as HTMLElement;
    do {
      target = target.parentElement as HTMLElement;
    } while (target !== null && target.tagName !== 'A');
    if (target !== null) target.children[1].classList.add('hidden');
  };
}
