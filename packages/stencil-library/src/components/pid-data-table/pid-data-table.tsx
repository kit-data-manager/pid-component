// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, Event, EventEmitter, h, Prop, State, Watch } from '@stencil/core';
import { FoldableItem } from '../../utils/FoldableItem';

@Component({
  tag: 'pid-data-table',
  shadow: false,
})
export class PidDataTable {
  /**
   * Unique ID for the table element
   */
  private tableId: string = `pid-data-table-${Math.random().toString(36).substring(2, 9)}`;
  /**
   * Array of items to display in the table
   */
  @Prop() items: FoldableItem[] = [];

  /**
   * Number of items to show per page
   */
  @Prop({ mutable: true }) itemsPerPage: number = 10;

  /**
   * Current page (0-based index)
   */
  @Prop({ mutable: true }) currentPage: number = 0;

  /**
   * Available page sizes
   */
  @Prop() pageSizes: number[] = [5, 10, 25, 50, 100];

  /**
   * Whether to load subcomponents
   */
  @Prop() loadSubcomponents: boolean = false;

  /**
   * Whether to hide subcomponents
   */
  @Prop() hideSubcomponents: boolean = false;

  /**
   * Current level of subcomponents
   */
  @Prop() currentLevelOfSubcomponents: number = 0;

  /**
   * Total level of subcomponents
   */
  @Prop() levelOfSubcomponents: number = 1;

  /**
   * Settings to pass to subcomponents
   */
  @Prop() settings: string = '[]';

  /**
   * The dark mode setting for the component
   * Options: "light", "dark", "system"
   * Default: "system"
   */
  @Prop() darkMode: 'light' | 'dark' | 'system' = 'system';

  /**
   * Event emitted when page changes
   */
  @Event() pageChange: EventEmitter<number>;

  /**
   * Event emitted when items per page changes
   */
  @Event() itemsPerPageChange: EventEmitter<number>;

  /**
   * Filtered items based on current page
   */
  @State() filteredItems: FoldableItem[] = [];

  /**
   * Watch for changes in items
   */
  @Watch('items')
  @Watch('currentPage')
  @Watch('itemsPerPage')
  updateFilteredItems() {
    this.filteredItems = this.items.filter((_, index) => {
      return index >= this.currentPage * this.itemsPerPage && index < this.currentPage * this.itemsPerPage + this.itemsPerPage;
    });

    // Reset page if we're beyond the available pages
    const maxPage = Math.ceil(this.items.length / this.itemsPerPage) - 1;
    if (this.currentPage > maxPage && maxPage >= 0) {
      this.currentPage = maxPage;
    }
  }

  componentWillLoad() {
    this.updateFilteredItems();
  }

  render() {
    // Check if dark mode is active
    const isDarkMode = this.darkMode === 'dark' || (this.darkMode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (this.items.length === 0) {
      return (
        <div
          class={
            isDarkMode
              ? 'm-1 rounded-lg border border-gray-700 bg-gray-800 p-4 text-center text-gray-300'
              : 'm-1 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500'
          }
          role="status"
          aria-live="polite"
          aria-label="No data available"
        >
          <p class="m-0">No data available</p>
        </div>
      );
    }

    return (
      <div class={isDarkMode ? 'm-1 flex h-full flex-col rounded-lg border border-gray-700 bg-gray-800' : 'm-1 flex h-full flex-col rounded-lg border border-gray-200 bg-gray-50'}>
        {/* Table container with scrollable content */}
        <div class="relative z-10 flex-grow overflow-auto">
          <table
            id={this.tableId}
            class={`w-full table-fixed border-collapse text-left font-sans text-sm select-text ${isDarkMode ? 'text-gray-200' : ''}`}
            aria-label="Data table with properties and values"
            role="table"
          >
            <thead class="sticky top-0 z-20 rounded-t-lg bg-slate-600 text-slate-200">
              <tr class="font-semibold" role="row">
                <th class="w-[30%] min-w-[150px] rounded-tl-lg px-2 py-2" scope="col" role="columnheader">
                  Key
                </th>
                <th class="w-[70%] rounded-tr-lg px-2 py-2" scope="col" role="columnheader">
                  Value
                </th>
              </tr>
            </thead>
            <tbody class={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} role="rowgroup">
              {this.filteredItems.map((value, index) => (
                <tr
                  key={`item-${value.keyTitle}-${index}`}
                  class={
                    isDarkMode
                      ? `odd:bg-gray-700 even:bg-gray-800 ${index !== this.filteredItems.length - 1 ? 'border-b border-gray-700' : ''}`
                      : `odd:bg-slate-200 even:bg-gray-50 ${index !== this.filteredItems.length - 1 ? 'border-b border-gray-200' : ''}`
                  }
                  aria-label={`Row for ${value.keyTitle} with value ${value.value}`}
                  role="row"
                >
                  <td class={'w-auto min-w-[150px] p-2 align-top font-mono'} role="cell">
                    <pid-tooltip text={value.keyTooltip || `Details for ${value.keyTitle}`} position="top" maxHeight="200px" aria-label={`Information about ${value.keyTitle}`}>
                      <div slot="trigger" class="flex min-h-7 w-full items-center overflow-hidden">
                        <a
                          href={value.keyLink}
                          target={'_blank'}
                          rel={'noopener noreferrer'}
                          class="mr-2 truncate rounded text-blue-600 underline hover:text-blue-800 focus:text-blue-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
                          onClick={e => e.stopPropagation()}
                          aria-label={`Open ${value.keyTitle} in new tab`}
                        >
                          {value.keyTitle}
                        </a>
                      </div>
                    </pid-tooltip>
                  </td>
                  <td class={'relative w-full p-2 align-top text-sm select-text'} role="cell">
                    <div class="grid w-full grid-cols-[1fr_auto] items-start gap-2">
                      <div class="min-w-0 break-words whitespace-normal">
                        {
                          // Load a foldable subcomponent if subcomponents are not disabled (hideSubcomponents), and the current level of subcomponents is not the total level of subcomponents. If the subcomponent is on the bottom level of the hierarchy, render just a preview. If the value should not be resolved (isFoldable), just render the value as text.
                          this.loadSubcomponents && !this.hideSubcomponents && value.renderDynamically ? (
                            <pid-component
                              value={value.value}
                              levelOfSubcomponents={this.levelOfSubcomponents}
                              currentLevelOfSubcomponents={this.currentLevelOfSubcomponents + 1}
                              amountOfItems={this.itemsPerPage}
                              settings={this.settings}
                              openByDefault={false}
                              class="block w-full min-w-0"
                            />
                          ) : !this.hideSubcomponents && this.currentLevelOfSubcomponents === this.levelOfSubcomponents && value.renderDynamically ? (
                            <pid-component
                              value={value.value}
                              levelOfSubcomponents={this.currentLevelOfSubcomponents}
                              currentLevelOfSubcomponents={this.currentLevelOfSubcomponents + 1}
                              amountOfItems={this.itemsPerPage}
                              settings={this.settings}
                              hideSubcomponents={true}
                              openByDefault={false}
                              class="block w-full min-w-0"
                            />
                          ) : (
                            <span class={'inline-block max-w-full overflow-x-auto font-mono text-sm break-words whitespace-normal'}>{value.value}</span>
                          )
                        }
                      </div>
                      <div class="flex-shrink-0">
                        <copy-button
                          value={value.value}
                          class={`visible z-50 cursor-pointer rounded-sm ${isDarkMode ? 'bg-gray-700/90 hover:bg-gray-600' : 'bg-white/90 hover:bg-white'} opacity-100 shadow-sm transition-all duration-200 hover:shadow-md`}
                          aria-label={`Copy ${value.keyTitle} value to clipboard`}
                          title={`Copy ${value.keyTitle} value to clipboard`}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
