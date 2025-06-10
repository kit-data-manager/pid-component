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
   * Event emitted when page changes
   */
  @Event() pageChange: EventEmitter<number>;

  /**
   * Handle page change
   */
  private handlePageChange = (page: number) => {
    if (page >= 0 && page <= this.totalPages - 1) {
      this.pageChange.emit(page);
    }
  };

  /**
   * Get total number of pages
   */
  private get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /**
   * Get range of items being displayed
   */
  private get displayRange(): { start: number; end: number } {
    const start = this.currentPage * this.itemsPerPage + 1;
    const end = Math.min((this.currentPage + 1) * this.itemsPerPage, this.totalItems);
    return { start, end };
  }

  render() {
    if (this.totalItems <= 0) {
      return null;
    }

    return (
      <div class="flex items-center justify-between border-t border-gray-200 bg-white px-1 py-1 text-xs">
        <div class="hidden sm:flex sm:flex-1 sm:flex-nowrap sm:items-center sm:justify-between">
          <div>
            <p class="text-xs text-gray-700">
              Showing
              <span class="font-medium"> {this.displayRange.start} </span>
              to
              <span class="font-medium"> {this.displayRange.end} </span>
              of
              <span class="font-medium"> {this.totalItems} </span>
              entries
            </p>
          </div>
          <div>
            {this.totalItems > this.itemsPerPage ? (
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="PidPagination">
                <button
                  onClick={() => this.handlePageChange(this.currentPage - 1)}
                  disabled={this.currentPage === 0}
                  class="relative inline-flex items-center rounded-l-md px-1 py-0.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {Array(this.totalPages)
                  .fill(0)
                  .map((_, index) => (
                    <button
                      key={`page-${index}`}
                      onClick={() => this.handlePageChange(index)}
                      class={
                        index === this.currentPage
                          ? 'relative z-10 inline-flex items-center bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'relative hidden items-center px-2 py-0.5 text-xs font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 md:inline-flex'
                      }
                      aria-label={`Page ${index + 1}`}
                      aria-current={index === this.currentPage ? 'page' : undefined}
                    >
                      {index + 1}
                    </button>
                  ))}
                <button
                  onClick={() => this.handlePageChange(this.currentPage + 1)}
                  disabled={this.currentPage >= this.totalPages - 1}
                  class="relative inline-flex items-center rounded-r-md px-1 py-0.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
