import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

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
   * Enable adaptive pagination mode
   */
  @Prop() adaptivePagination: boolean = false;

  /**
   * Whether to show the items per page control
   */
  @Prop() showItemsPerPageControl: boolean = true;

  /**
   * Event emitted when page changes
   */
  @Event() pageChange: EventEmitter<number>;

  /**
   * Event emitted when items per page changes
   */
  @Event() itemsPerPageChange: EventEmitter<number>;

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
    this.itemsPerPageChange.emit(size);
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
    const needsPagination = this.totalItems > this.itemsPerPage;

    // Generate a unique ID for this pagination component for ARIA relationships
    const paginationId = `pagination-${Math.random().toString(36).substring(2, 11)}`;

    return (
      <div class="flex flex-wrap items-center justify-between gap-2 py-1 px-3 text-sm bg-white w-full resize-none" role="navigation" aria-labelledby={`${paginationId}-label`}>
        {/* Hidden label for screen readers */}
        <span id={`${paginationId}-label`} class="sr-only">
          Pagination controls and display settings
        </span>

        {/* Left side: Page size selector and info - ALWAYS SHOWN */}
        <div class="flex flex-wrap items-center gap-2 text-gray-600">
          {/* Horizontal page size selector - Only shown when not in adaptive mode and when control is enabled */}
          {!this.adaptivePagination && this.showItemsPerPageControl && (
            <div class="flex items-center gap-1" role="group" aria-label="Items per page options">
              <span class="text-xs text-gray-600 whitespace-nowrap" id={`${paginationId}-itemsperpage-label`}>
                Items per page:
              </span>
              <div class="flex items-center gap-0.5 rounded border border-gray-200 bg-white p-0.5" role="toolbar" aria-labelledby={`${paginationId}-itemsperpage-label`}>
                {this.pageSizes.map(size => (
                  <button
                    key={`size-${size}`}
                    onClick={() => this.handleItemsPerPageChange(size)}
                    class={`px-2 py-0.5 text-xs rounded transition-colors resize-none ${
                      this.itemsPerPage === size ? 'bg-blue-600 text-white font-medium' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label={`Show ${size} items per page`}
                    aria-pressed={this.itemsPerPage === size ? 'true' : 'false'}
                    aria-current={this.itemsPerPage === size ? 'true' : undefined}
                    type="button"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* When in adaptive mode, show indicator */}
          {this.adaptivePagination && (
            <div class="flex items-center gap-1">
              <span class="text-xs text-gray-600 whitespace-nowrap px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full" role="status" aria-live="polite">
                <span class="sr-only">Currently using </span>
                Adaptive pagination: {this.itemsPerPage} items
              </span>
            </div>
          )}

          {/* Item range display */}
          <span class="hidden text-xs text-gray-600 sm:block whitespace-nowrap" role="status" aria-live="polite">
            Showing {this.displayRange.start}-{this.displayRange.end} of {this.totalItems}
          </span>
        </div>

        {/* Right side: Pagination controls - ONLY SHOWN WHEN NEEDED */}
        {needsPagination && (
          <div class="flex items-center">
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm resize-none" aria-label="Pagination" role="navigation">
              {/* Previous button */}
              <button
                onClick={() => this.handlePageChange(this.currentPage - 1)}
                disabled={this.currentPage === 0}
                class="relative inline-flex items-center rounded-l-md px-2 py-1.5 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                aria-label="Previous page"
                title="Go to previous page"
                type="button"
              >
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                  <title>Previous</title>
                  <desc>Arrow pointing to the left</desc>
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
                    <span
                      key={`ellipsis-${i}`}
                      class="relative inline-flex items-center px-2 py-1.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 resize-none"
                      role="separator"
                      aria-label="More pages"
                      aria-hidden="true"
                    >
                      <span aria-hidden="true">...</span>
                      <span class="sr-only">More pages</span>
                    </span>
                  );
                }

                // Render page number
                const pageNum = page as number;
                const isCurrentPage = pageNum === this.currentPage;
                const humanPageNum = pageNum + 1; // Convert to 1-based for display

                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => this.handlePageChange(pageNum)}
                    class={
                      isCurrentPage
                        ? 'relative z-10 inline-flex items-center bg-blue-600 px-2 py-1.5 text-xs font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 resize-none'
                        : 'relative inline-flex items-center px-2 py-1.5 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none'
                    }
                    aria-label={`Page ${humanPageNum}`}
                    aria-current={isCurrentPage ? 'page' : undefined}
                    type="button"
                    title={`Go to page ${humanPageNum}`}
                  >
                    {humanPageNum}
                  </button>
                );
              })}

              {/* Next button */}
              <button
                onClick={() => this.handlePageChange(this.currentPage + 1)}
                disabled={this.currentPage >= this.totalPages - 1}
                class="relative inline-flex items-center rounded-r-md px-2 py-1.5 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                aria-label="Next page"
                title="Go to next page"
                type="button"
              >
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                  <title>Next</title>
                  <desc>Arrow pointing to the right</desc>
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
