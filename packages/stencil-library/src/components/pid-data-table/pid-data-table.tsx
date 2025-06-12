import { Component, Event, EventEmitter, h, Listen, Prop, State, Watch } from '@stencil/core';
import { FoldableItem } from '../../utils/FoldableItem';

@Component({
  tag: 'pid-data-table',
  shadow: false,
})
export class PidDataTable {
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
   * Enable adaptive pagination mode
   */
  @Prop() adaptivePagination: boolean = false;

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
   * Listen for tooltip expansion events to adjust table layout if needed
   */
  @Listen('tooltipExpansionChange')
  handleTooltipExpansion(event: CustomEvent<{ expand: boolean; requiredHeight: number }>) {
    const { expand, requiredHeight } = event.detail;

    if (expand) {
      // Optionally handle table-wide adjustments when tooltip expands
      // For now, the row expansion is handled by the tooltip itself
      console.log(`Tooltip expanded, requiring ${requiredHeight}px height`);
    } else {
      // Handle cleanup when tooltip collapses
      console.log('Tooltip collapsed');
    }
  }

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
    if (this.items.length === 0) {
      return (
        <div class="rounded-lg border border-gray-200 bg-gray-50 m-1 p-4 text-center text-gray-500" role="status" aria-live="polite">
          No data available
        </div>
      );
    }

    // Adjust container and table classes based on adaptive pagination mode
    const containerClass = this.adaptivePagination
      ? 'rounded-lg border border-gray-200 bg-gray-50 m-1 flex flex-col h-full'
      : 'rounded-lg border border-gray-200 bg-gray-50 m-1 flex flex-col h-full';

    const tableContainerClass = this.adaptivePagination ? 'flex-'flex-grow relative z-10 overflow-hidden'erflow-au'overflow-auto flex-grow relative z-10'n (
      <div class={containerClass}>
        {/* Table container with scrollable content */}
        <div class={tableContainerClass}>
          <table class="w-full text-left text-sm font-sans select-text border-collapse table-fixed" aria-label="Data table" role="table">
            <thead class="bg-slate-600 text-slate-200 rounded-t-lg sticky top-0 z-20">
              <tr class="font-semibold" role="row">
                <th class="px-2 py-2 min-w-[150px] w-[30%] rounded-tl-lg" scope="col" role="columnheader">
                  Key
                </th>
                <th class="px-2 py-2 w-[70%] rounded-tr-lg" scope="col" role="columnheader">
                  Value
                </th>
              </tr>
            </thead>
            <tbody class="bg-gray-50" role="rowgroup">
              {this.filteredItems.map((value, index) => (
                <tr
                  key={`item-${value.keyTitle}-${index}`}
                  class={`odd:bg-slate-200 even:bg-gray-50 leading-7 ${index !== this.filteredItems.length - 1 ? 'border-b border-gray-200' : ''}`}
                  style={{ minHeight: '28px' }} // Base minimum height for rows
                  role="row"
                >
                  <td class={'p-2 min-w-[150px] w-auto font-mono align-top'} role="cell">
                    <pid-tooltip text={value.keyTooltip || `Details for ${value.keyTitle}`} position="top" maxHeight="200px">
                      <div slot="trigger" class="min-h-7 leading-7 overflow-hidden w-full flex items-center">
                        <a
                          href={value.keyLink}
                          target={'_blank'}
                          rel={'noopener noreferrer'}
                          class="mr-2 text-blue-600 underline hover:text-blue-800 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded truncate"
                          onClick={e => e.stopPropagation()}
                          aria-label={`Open ${value.keyTitle} in new tab`}
                        >
                          {value.keyTitle}
                        </a>
                      </div>
                    </pid-tooltip>
                  </td>
                  <td class={'align-top text-sm p-2 w-full select-text relative'} role="cell">
                    <div class="w-full min-h-7 pr-8 flex items-start relative">
                      <div class="w-full overflow-x-auto whitespace-normal break-words max-h-[200px] overflow-y-auto">
                        {
                          // Load a foldable subcomponent if subcomponents are not disabled (hideSubcomponents), and the current level of subcomponents is not the total level of subcomponents. If the subcomponent is on the bottom level of the hierarchy, render just a preview. If the value should not be resolved (isFoldable), just render the value as text.
                          this.loadSubcomponents && !this.hideSubcomponents && !value.renderDynamically ? (
                            <pid-component
                              value={value.value}
                              levelOfSubcomponents={this.levelOfSubcomponents}
                              currentLevelOfSubcomponents={this.currentLevelOfSubcomponents + 1}
                              amountOfItems={this.itemsPerPage}
                              settings={this.settings}
                              openByDefault={false}
                              class="flex-grow"
                            />
                          ) : !this.hideSubcomponents && this.currentLevelOfSubcomponents === this.levelOfSubcomponents && !value.renderDynamically ? (
                            <pid-component
                              value={value.value}
                              levelOfSubcomponents={this.currentLevelOfSubcomponents}
                              currentLevelOfSubcomponents={this.currentLevelOfSubcomponents + 1}
                              amountOfItems={this.itemsPerPage}
                              settings={this.settings}
                              hideSubcomponents={true}
                              openByDefault={false}
                              class="flex-grow"
                            />
                          ) : (
                            <span class={'font-mono text-sm overflow-x-auto whitespace-normal break-words inline-block max-w-full'}>{value.value}</span>
                          )
                        }
                      </div>
                    </div>
                    <copy-button
                      value={value.value}
                      class="absolute right-2 top-2 flex-shrink-0 z-30 opacity-100 visible hover:z-35 cursor-pointer"
                      aria-label={`Copy ${value.keyTitle} value`}
                    />
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
