import { Component, Event, EventEmitter, h, Prop, State, Watch } from '@stencil/core';
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

  // /**
  //  * Handle page change from pagination component
  //  */
  // private handlePageChange = (page: number) => {
  //   this.currentPage = page;
  //   this.pageChange.emit(page);
  // };
  //
  // /**
  //  * Handle items per page change from pagination component
  //  */
  // private handleItemsPerPageChange = (size: number) => {
  //   // Calculate new page index to maintain visible items as much as possible
  //   const currentStartItem = this.currentPage * this.itemsPerPage;
  //   const newPage = Math.floor(currentStartItem / size);
  //
  //   this.itemsPerPage = size;
  //   this.currentPage = newPage;
  //
  //   this.itemsPerPageChange.emit(size);
  //   this.pageChange.emit(newPage);
  // };

  componentWillLoad() {
    this.updateFilteredItems();
  }

  render() {
    if (this.items.length === 0) {
      return null;
    }

    return (
      <div class="rounded-lg border border-gray-200 bg-gray-50 m-1 flex flex-col h-full">
        {/* Table container with scrollable content */}
        <div class="overflow-auto flex-grow">
          <table class="w-full text-left text-sm font-sans select-text border-collapse table-fixed" aria-label="Data table">
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
              {this.filteredItems.map((value, index) => (
                <tr
                  key={`item-${value.keyTitle}`}
                  class={`odd:bg-slate-200 even:bg-gray-50 h-7 leading-7 ${index !== this.filteredItems.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <td class={'p-2 min-w-[150px] w-auto font-mono align-middle'}>
                    <pid-tooltip text={value.keyTooltip || `Details for ${value.keyTitle}`}>
                      <div slot="trigger" class="h-7 leading-7 overflow-hidden w-full flex items-center">
                        <a
                          href={value.keyLink}
                          target={'_blank'}
                          rel={'noopener noreferrer'}
                          class="mr-2 text-blue-600 underline hover:text-blue-800 truncate"
                          onClick={e => e.stopPropagation()}
                        >
                          {value.keyTitle}
                        </a>
                      </div>
                    </pid-tooltip>
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
                    <copy-button value={value.value} class="absolute right-2 top-1/2 -translate-y-1/2 flex-shrink-0 z-30 opacity-100 visible hover:z-40 cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/*/!* Fixed footer with enhanced pagination - always visible at the bottom *!/*/}
        {/*<div class="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 mt-auto w-full">*/}
        {/*  <pid-pagination*/}
        {/*    currentPage={this.currentPage}*/}
        {/*    totalItems={this.items.length}*/}
        {/*    itemsPerPage={this.itemsPerPage}*/}
        {/*    pageSizes={this.pageSizes}*/}
        {/*    onPageChange={e => this.handlePageChange(e.detail)}*/}
        {/*    onItemsPerPageChange={e => this.handleItemsPerPageChange(e.detail)}*/}
        {/*  />*/}
        {/*</div>*/}
      </div>
    );
  }
}
