import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'pid-pagination',
  shadow: false,
})
export class PidPagination {
  /**
   * Current page (0-based index)
   */
  @Prop() currentPage: number = 0;

  /**
   * Total number of items
   */
  @Prop() totalItems: number = 0;

  /**
   * Number of items per page
   */
  @Prop() itemsPerPage: number = 10;

  /**
   * Available page sizes
   */
  @Prop() pageSizes: number[] = [5, 10, 25, 50, 100];

  /**
   * Event emitted when page changes
   */
  @Event() pageChange: EventEmitter<number>;

  /**
   * Event emitted when items per page changes
   */
  @Event() itemsPerPageChange: EventEmitter<number>;

  /**
   * Internal state for dropdown visibility
   */
  @State() isDropdownOpen: boolean = false;

  /**
   * Handle page change
   */
  private handlePageChange = (page: number) => {
    if (page >= 0 && page <= this.totalPages - 1) {
      this.pageChange.emit(page);
    }
  };

  /**
   * Handle items per page change
   */
  private handleItemsPerPageChange = (size: number) => {
    this.isDropdownOpen = false;
    this.itemsPerPageChange.emit(size);
  };

  /**
   * Toggle dropdown
   */
  private toggleDropdown = () => {
    this.isDropdownOpen = !this.isDropdownOpen;
  };

  /**
   * Get total number of pages
   */
  private get totalPages() {
    return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
  }

  /**
   * Get range of items being displayed
   */
  private get displayRange() {
    if (this.totalItems === 0) {
      return { start: 0, end: 0 };
    }
    const start = this.currentPage * this.itemsPerPage + 1;
    const end = Math.min((this.currentPage + 1) * this.itemsPerPage, this.totalItems);
    return { start, end };
  }

  /**
   * Get visible page numbers (with truncation if needed)
   */
  private getVisiblePageNumbers() {
    const maxPages = 7; // Max number of pages to show (not including ellipsis)
    const pages: (number | string)[] = [];

    if (this.totalPages <= maxPages) {
      // Show all pages if there are few enough
      return Array.from({ length: this.totalPages }, (_, i) => i);
    }

    // Always show first page
    pages.push(0);

    // Calculate range around current page
    let rangeStart = Math.max(1, this.currentPage - 1);
    let rangeEnd = Math.min(this.totalPages - 2, this.currentPage + 1);

    // Adjust range to show at least 3 pages
    if (rangeEnd - rangeStart < 2) {
      if (this.currentPage < this.totalPages / 2) {
        rangeEnd = Math.min(this.totalPages - 2, rangeStart + 2);
      } else {
        rangeStart = Math.max(1, rangeEnd - 2);
      }
    }

    // Add ellipsis before range if needed
    if (rangeStart > 1) {
      pages.push('...');
    }

    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis after range if needed
    if (rangeEnd < this.totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    pages.push(this.totalPages - 1);

    return pages;
  }

  render() {
    if (this.totalItems <= 0) {
      return null;
    }

    const visiblePages = this.getVisiblePageNumbers();

    return (
      <div class="flex flex-wrap items-center justify-between gap-2 py-2 px-3 text-sm bg-white relative z-40 overflow-visible">
        {/* Left side: Page size selector and info */}
        <div class="flex items-center gap-2 text-gray-600">
          <div class="relative inline-block">
            <button
              onClick={this.toggleDropdown}
              class="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>{this.itemsPerPage} per page</span>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={this.isDropdownOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
              </svg>
            </button>

            {this.isDropdownOpen && (
              <div class="absolute left-0 z-50 mt-1 w-32 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div class="py-1" role="menu" aria-orientation="vertical">
                  {this.pageSizes.map(size => (
                    <button
                      key={`size-${size}`}
                      onClick={() => this.handleItemsPerPageChange(size)}
                      class={`block w-full px-4 py-2 text-left text-xs ${this.itemsPerPage === size ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                      role="menuitem"
                    >
                      {size} items
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span class="hidden text-xs text-gray-600 sm:block">
            Showing {this.displayRange.start}-{this.displayRange.end} of {this.totalItems}
          </span>
        </div>

        {/* Right side: Pagination controls */}
        {this.totalItems > this.itemsPerPage && (
          <div class="flex items-center">
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              {/* Previous button */}
              <button
                onClick={() => this.handlePageChange(this.currentPage - 1)}
                disabled={this.currentPage === 0}
                class="relative inline-flex items-center rounded-l-md px-2 py-1.5 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fill-rule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06-.02z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              {/* Page numbers with ellipsis */}
              {visiblePages.map((page, i) => {
                // Render ellipsis
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${i}`} class="relative inline-flex items-center px-2 py-1.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300">
                      ...
                    </span>
                  );
                }

                // Render page number
                const pageNum = page as number;
                const isCurrentPage = pageNum === this.currentPage;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => this.handlePageChange(pageNum)}
                    class={
                      isCurrentPage
                        ? 'relative z-10 inline-flex items-center bg-blue-600 px-2 py-1.5 text-xs font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'relative inline-flex items-center px-2 py-1.5 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                    }
                    aria-label={`Page ${pageNum + 1}`}
                    aria-current={isCurrentPage ? 'page' : undefined}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              {/* Next button */}
              <button
                onClick={() => this.handlePageChange(this.currentPage + 1)}
                disabled={this.currentPage >= this.totalPages - 1}
                class="relative inline-flex items-center rounded-r-md px-2 py-1.5 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fill-rule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    );
  }
}
