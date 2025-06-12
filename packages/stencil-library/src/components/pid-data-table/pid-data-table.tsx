import { Component, Event, EventEmitter, h, Listen, Prop, State, Watch } from '@stencil/core';
import { FoldableItem } from '../../utils/FoldableItem';

@Component({
  tag: 'pid-data-table',
  shadow: false,
})
export class PidDataTable {
  /**
   * Tracks which subcomponents are expanded
   */
  @State() expandedSubcomponents: Set<string> = new Set();

  /**
   * Tracks the measured heights of rows
   */
  @State() rowHeights: Map<string, number> = new Map();

  /**
   * Event emitted when row heights change
   */
  @Event() rowHeightsChange: EventEmitter<{ totalHeight: number; averageHeight: number }>;

  /**
   * Reference to the table element for measurements
   */
  private tableRef?: HTMLTableElement;
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
   * Estimated height of each table row in pixels (used as fallback)
   */
  @Prop() estimatedRowHeight: number = 40;

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
   * Handle subcomponent expansion/collapse
   */
  // Debounce timer for subcomponent toggle
  private toggleDebounceTimer: any = null;

  handleSubcomponentToggle = (event: CustomEvent<boolean>, itemId: string) => {
    // Stop propagation to prevent parent components from handling the event
    event.stopPropagation();

    if (event.detail) {
      // Subcomponent expanded
      this.expandedSubcomponents.add(itemId);
    } else {
      // Subcomponent collapsed
      this.expandedSubcomponents.delete(itemId);
    }

    // Force update by creating a new Set
    this.expandedSubcomponents = new Set(this.expandedSubcomponents);

    // Clear any existing debounce timer
    if (this.toggleDebounceTimer) {
      clearTimeout(this.toggleDebounceTimer);
    }

    // Debounce the measurement and page change to prevent rapid successive updates
    this.toggleDebounceTimer = setTimeout(() => {
      // Only measure if we're not already measuring
      if (!this.isMeasuring) {
        this.isMeasuring = true;
        this.measureRowHeights();
        setTimeout(() => {
          this.isMeasuring = false;
        }, 50);
      }

      // Emit event to notify parent component that pagination may need to be adjusted
      this.pageChange.emit(this.currentPage);
    }, 150); // Debounce for 150ms
  };

  /**
   * Measures the heights of all rows and updates the rowHeights map
   */
  // Store previous measurements to detect significant changes
  private previousAverageHeight: number = 0;

  private measureRowHeights = () => {
    if (!this.tableRef) return;

    const rows = this.tableRef.querySelectorAll('tbody tr');
    let totalHeight = 0;
    let rowCount = 0;

    // Don't clear previous measurements if there are no rows to measure
    // This prevents unnecessary updates when the table is empty
    if (rows.length === 0) return;

    // Create a new map for measurements
    const newRowHeights = new Map<string, number>();

    // Measure each row
    rows.forEach((row, index) => {
      const item = this.filteredItems[index];
      if (!item) return;

      const height = row.getBoundingClientRect().height;
      const rowId = `${item.keyTitle}-${index}`;

      newRowHeights.set(rowId, height);
      totalHeight += height;
      rowCount++;
    });

    // Calculate average height
    const averageHeight = rowCount > 0 ? totalHeight / rowCount : this.estimatedRowHeight || 40;

    // Only update and emit if there's a significant change (more than 5%)
    const heightDifference = Math.abs(this.previousAverageHeight - averageHeight);
    const significantChange = this.previousAverageHeight === 0 || heightDifference / Math.max(1, this.previousAverageHeight) > 0.05;

    if (significantChange) {
      // Update the previous average height
      this.previousAverageHeight = averageHeight;

      // Update the row heights map
      this.rowHeights = newRowHeights;

      // Emit event with height information
      this.rowHeightsChange.emit({
        totalHeight,
        averageHeight,
      });
    }
  };

  /**
   * Watch for changes in items
   */
  @Watch('items')
  @Watch('currentPage')
  @Watch('itemsPerPage')
  @Watch('expandedSubcomponents')
  updateFilteredItems() {
    // When a subcomponent is expanded, we want to keep it on the same page
    // and let other items reflow to the next page if necessary

    if (this.expandedSubcomponents.size === 0) {
      // If no subcomponents are expanded, use standard pagination
      const startIndex = this.currentPage * this.itemsPerPage;
      const endIndex = Math.min(startIndex + this.itemsPerPage, this.items.length);
      this.filteredItems = this.items.slice(startIndex, endIndex);
    } else {
      // If subcomponents are expanded, we need to handle pagination differently
      // to keep expanded items on their original page

      // First, determine which page each expanded item belongs to
      const expandedItemsInfo = Array.from(this.expandedSubcomponents)
        .map(id => {
          // Extract index from the ID (format: "keyTitle-index")
          const parts = id.split('-');
          const keyTitle = parts.slice(0, -1).join('-'); // Handle keys with hyphens
          const index = parseInt(parts[parts.length - 1], 10);

          // Find the item in the items array
          const itemIndex = this.items.findIndex(item => item.keyTitle === keyTitle && !isNaN(index));

          if (itemIndex === -1) return null;

          // Calculate which page this item would normally be on
          const page = Math.floor(itemIndex / this.itemsPerPage);

          return { itemIndex, page, id };
        })
        .filter(Boolean); // Remove null entries

      // Filter to only expanded items on the current page
      const expandedItemsOnCurrentPage = expandedItemsInfo.filter(info => info.page === this.currentPage);

      if (expandedItemsOnCurrentPage.length === 0) {
        // If no expanded items on current page, use standard pagination
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.items.length);
        this.filteredItems = this.items.slice(startIndex, endIndex);
      } else {
        // If we have expanded items on this page, keep them on this page
        // and adjust other items accordingly

        // Get the base range for this page
        const baseStartIndex = this.currentPage * this.itemsPerPage;
        const baseEndIndex = Math.min(baseStartIndex + this.itemsPerPage, this.items.length);

        // Get all item indices that should be on this page
        // Start with the expanded items that belong on this page
        const itemIndicesOnThisPage = expandedItemsOnCurrentPage.map(info => info.itemIndex);

        // Calculate how many regular items we can fit
        const remainingSlots = this.itemsPerPage - expandedItemsOnCurrentPage.length;

        // Add regular items that fit on this page
        if (remainingSlots > 0) {
          // Get all non-expanded items
          const nonExpandedIndices = [];
          for (let i = baseStartIndex; i < baseEndIndex; i++) {
            // Check if this item is not one of the expanded items
            if (!itemIndicesOnThisPage.includes(i)) {
              nonExpandedIndices.push(i);
              // Stop if we've filled all remaining slots
              if (nonExpandedIndices.length >= remainingSlots) break;
            }
          }

          // Add these indices to our page
          itemIndicesOnThisPage.push(...nonExpandedIndices);
        }

        // Sort indices to maintain original order
        itemIndicesOnThisPage.sort((a, b) => a - b);

        // Create the filtered items array based on these indices
        this.filteredItems = itemIndicesOnThisPage.map(index => this.items[index]);
      }
    }

    // Reset page if we're beyond the available pages
    const maxPage = Math.ceil(this.items.length / this.itemsPerPage) - 1;
    if (this.currentPage > maxPage && maxPage >= 0) {
      this.currentPage = maxPage;
    }
  }

  componentWillLoad() {
    this.updateFilteredItems();
  }

  componentDidLoad() {
    // Measure row heights after initial rendering, but only if there are items to measure
    // This prevents unnecessary measurements when the table is empty
    if (this.filteredItems.length > 0) {
      // Use a longer timeout to ensure the table is fully rendered
      // This is especially important for the initial load
      setTimeout(() => {
        if (!this.isMeasuring) {
          this.isMeasuring = true;
          this.measureRowHeights();
          setTimeout(() => {
            this.isMeasuring = false;
          }, 50);
        }
      }, 300);
    }
  }

  // Track if we're currently measuring to prevent infinite loops
  private isMeasuring: boolean = false;

  componentDidUpdate() {
    // Only measure heights if we're not already measuring
    // This prevents infinite loops caused by measurement -> update -> measurement cycles
    if (!this.isMeasuring) {
      this.isMeasuring = true;
      setTimeout(() => {
        this.measureRowHeights();
        this.isMeasuring = false;
      }, 100);
    }
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
    // Using Tailwind classes for consistent styling
    const containerClass = 'rounded-lg border border-gray-200 bg-gray-50 m-1 flex flex-col h-full';

    // In adaptive mode, use overflow-hidden to prevent scrolling within the table
    // This ensures the table is always fully visible without internal scrolling
    const tableContainerClass = this.adaptivePagination ? 'flex-grow relative z-10 overflow-hidden' : 'overflow-auto flex-grow relative z-10';

    return (
      <div class={containerClass}>
        {/* Table container with scrollable content */}
        <div class={tableContainerClass}>
          <table
            class="w-full text-left text-sm font-sans select-text border-collapse table-fixed"
            aria-label="Data table"
            role="table"
            ref={el => (this.tableRef = el as HTMLTableElement)}
          >
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
                              adaptivePagination={this.adaptivePagination}
                              onCollapsibleToggle={e => this.handleSubcomponentToggle(e, `${value.keyTitle}-${index}`)}
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
                              adaptivePagination={this.adaptivePagination}
                              onCollapsibleToggle={e => this.handleSubcomponentToggle(e, `${value.keyTitle}-${index}`)}
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
