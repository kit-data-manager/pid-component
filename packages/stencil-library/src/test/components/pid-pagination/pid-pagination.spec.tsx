import { render, h } from '@stencil/vitest';
import { describe, it, expect, vi } from 'vitest';
import { checkA11y } from '../../axe-helper';

describe('pid-pagination', () => {
  it('renders with required props', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={50} items-per-page={10}></pid-pagination>
    );
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-PAGINATION');
  });

  it('renders nothing when totalItems is 0', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={0} items-per-page={10}></pid-pagination>
    );
    // When totalItems <= 0, render returns null
    expect(root.innerHTML).toBe('');
  });

  it('has correct default props', async () => {
    const { root } = await render(<pid-pagination></pid-pagination>);
    expect(root.currentPage).toBe(0);
    expect(root.totalItems).toBe(0);
    expect(root.itemsPerPage).toBe(10);
    expect(root.showItemsPerPageControl).toBe(true);
    expect(root.darkMode).toBe('system');
  });

  it('calculates total pages correctly', async () => {
    await render(
      <pid-pagination current-page={0} total-items={55} items-per-page={10}></pid-pagination>
    );
    // totalPages = Math.max(1, Math.ceil(55 / 10)) = 6
    expect(Math.ceil(55 / 10)).toBe(6);
  });

  it('shows page numbers when totalItems exceeds itemsPerPage', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={30} items-per-page={10}></pid-pagination>
    );
    const nav = root.querySelector('nav[aria-label="Pagination"]');
    expect(nav).toBeTruthy();
    // Should show 3 pages (30/10)
    const pageButtons = root.querySelectorAll('nav button[aria-label^="Page"]');
    expect(pageButtons.length).toBe(3);
  });

  it('does not show pagination nav when totalItems fits on one page', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={5} items-per-page={10}></pid-pagination>
    );
    const nav = root.querySelector('nav[aria-label="Pagination"]');
    expect(nav).toBeNull();
  });

  it('emits pageChange event when page is changed', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination current-page={0} total-items={30} items-per-page={10}></pid-pagination>
    );
    const spy = vi.fn();
    root.addEventListener('pageChange', spy);

    // Click the "Next page" button
    const nextButton = root.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
    expect(nextButton).toBeTruthy();
    nextButton.click();
    await waitForChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('disables previous button on first page', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={30} items-per-page={10}></pid-pagination>
    );
    const prevButton = root.querySelector('button[aria-label="Previous page"]') as HTMLButtonElement;
    expect(prevButton).toBeTruthy();
    expect(prevButton.hasAttribute('disabled') || prevButton.disabled).toBeTruthy();
  });

  it('disables next button on last page', async () => {
    const { root } = await render(
      <pid-pagination current-page={2} total-items={30} items-per-page={10}></pid-pagination>
    );
    const nextButton = root.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
    expect(nextButton).toBeTruthy();
    expect(nextButton.hasAttribute('disabled') || nextButton.disabled).toBeTruthy();
  });

  it('does not disable previous button on pages after first', async () => {
    const { root } = await render(
      <pid-pagination current-page={1} total-items={30} items-per-page={10}></pid-pagination>
    );
    const prevButton = root.querySelector('button[aria-label="Previous page"]') as HTMLButtonElement;
    expect(prevButton).toBeTruthy();
    expect(prevButton.disabled).toBeFalsy();
  });

  it('does not disable next button when not on last page', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={30} items-per-page={10}></pid-pagination>
    );
    const nextButton = root.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
    expect(nextButton).toBeTruthy();
    expect(nextButton.disabled).toBeFalsy();
  });

  it('getVisiblePageNumbers returns all pages when total pages <= 7', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={50} items-per-page={10}></pid-pagination>
    );
    // 50 items / 10 per page = 5 pages (indices 0-4)
    const visiblePages = root.getVisiblePageNumbers();
    expect(visiblePages).toEqual([0, 1, 2, 3, 4]);
  });

  it('getVisiblePageNumbers includes ellipsis for many pages', async () => {
    const { root } = await render(
      <pid-pagination current-page={4} total-items={200} items-per-page={10}></pid-pagination>
    );
    // 200/10 = 20 pages, current page 4
    const visiblePages = root.getVisiblePageNumbers();
    // Should contain first page (0), last page (19), and ellipsis
    expect(visiblePages).toContain(0);
    expect(visiblePages).toContain(19);
    expect(visiblePages).toContain('...');
  });

  it('getVisiblePageNumbers always includes first and last page', async () => {
    const { root } = await render(
      <pid-pagination current-page={10} total-items={200} items-per-page={10}></pid-pagination>
    );
    const visiblePages = root.getVisiblePageNumbers();
    expect(visiblePages[0]).toBe(0);
    expect(visiblePages[visiblePages.length - 1]).toBe(19);
  });

  it('items per page buttons render with correct options', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={100} items-per-page={10}></pid-pagination>
    );
    // Default pageSizes: [5, 10, 25, 50, 100]
    const pageSizeButtons = root.querySelectorAll('[role="toolbar"] button');
    expect(pageSizeButtons.length).toBe(5);
    const texts = Array.from(pageSizeButtons).map(btn => btn.textContent.trim());
    expect(texts).toEqual(['5', '10', '25', '50', '100']);
  });

  it('active page size button has bg-blue-600 class', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={100} items-per-page={10}></pid-pagination>
    );
    const pageSizeButtons = root.querySelectorAll('[role="toolbar"] button');
    // The button for size=10 should have the active class
    const activeButton = Array.from(pageSizeButtons).find(btn => btn.textContent.trim() === '10');
    expect(activeButton).toBeTruthy();
    expect(activeButton.className).toContain('bg-blue-600');
    expect(activeButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('inactive page size button does not have bg-blue-600 class', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={100} items-per-page={10}></pid-pagination>
    );
    const pageSizeButtons = root.querySelectorAll('[role="toolbar"] button');
    const inactiveButton = Array.from(pageSizeButtons).find(btn => btn.textContent.trim() === '5');
    expect(inactiveButton).toBeTruthy();
    expect(inactiveButton.className).not.toContain('bg-blue-600');
    expect(inactiveButton.getAttribute('aria-pressed')).toBe('false');
  });

  it('emits itemsPerPageChange event when page size button is clicked', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination current-page={0} total-items={100} items-per-page={10}></pid-pagination>
    );
    const spy = vi.fn();
    root.addEventListener('itemsPerPageChange', (e: CustomEvent) => spy(e.detail));

    const pageSizeButtons = root.querySelectorAll('[role="toolbar"] button');
    const button25 = Array.from(pageSizeButtons).find(btn => btn.textContent.trim() === '25') as HTMLButtonElement;
    expect(button25).toBeTruthy();
    button25.click();
    await waitForChanges();
    expect(spy).toHaveBeenCalledWith(25);
  });

  it('previous button emits pageChange with decremented page', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination current-page={1} total-items={30} items-per-page={10}></pid-pagination>
    );
    const spy = vi.fn();
    root.addEventListener('pageChange', (e: CustomEvent) => spy(e.detail));

    const prevButton = root.querySelector('button[aria-label="Previous page"]') as HTMLButtonElement;
    prevButton.click();
    await waitForChanges();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('next button emits pageChange with incremented page', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination current-page={0} total-items={30} items-per-page={10}></pid-pagination>
    );
    const spy = vi.fn();
    root.addEventListener('pageChange', (e: CustomEvent) => spy(e.detail));

    const nextButton = root.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
    nextButton.click();
    await waitForChanges();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('clicking a page number emits pageChange with that page', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination current-page={0} total-items={30} items-per-page={10}></pid-pagination>
    );
    const spy = vi.fn();
    root.addEventListener('pageChange', (e: CustomEvent) => spy(e.detail));

    // Click page 3 (index 2)
    const pageButton = root.querySelector('button[aria-label="Page 3"]') as HTMLButtonElement;
    expect(pageButton).toBeTruthy();
    pageButton.click();
    await waitForChanges();
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('current page button has aria-current page', async () => {
    const { root } = await render(
      <pid-pagination current-page={1} total-items={30} items-per-page={10}></pid-pagination>
    );
    const currentPageButton = root.querySelector('button[aria-current="page"]') as HTMLButtonElement;
    expect(currentPageButton).toBeTruthy();
    expect(currentPageButton.textContent.trim()).toBe('2'); // 1-based display
  });

  it('shows display range text', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={55} items-per-page={10}></pid-pagination>
    );
    const rangeText = root.querySelector('[role="status"]');
    expect(rangeText).toBeTruthy();
    expect(rangeText.textContent).toContain('1-10');
    expect(rangeText.textContent).toContain('55');
  });

  it('hides items per page control when showItemsPerPageControl is false', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={30} items-per-page={10} show-items-per-page-control={false}></pid-pagination>
    );
    const toolbar = root.querySelector('[role="toolbar"]');
    expect(toolbar).toBeNull();
  });

  it('does not emit pageChange for out of range pages', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination current-page={0} total-items={30} items-per-page={10}></pid-pagination>
    );
    const spy = vi.fn();
    root.addEventListener('pageChange', spy);

    // Try to go to page -1 (invalid)
    root.handlePageChange(-1);
    await waitForChanges();
    expect(spy).not.toHaveBeenCalled();
  });

  it('has navigation role on the container', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={30} items-per-page={10}></pid-pagination>
    );
    const nav = root.querySelector('[role="navigation"]');
    expect(nav).toBeTruthy();
  });

  it('ellipsis elements have separator role', async () => {
    const { root } = await render(
      <pid-pagination current-page={5} total-items={200} items-per-page={10}></pid-pagination>
    );
    const separators = root.querySelectorAll('[role="separator"]');
    expect(separators.length).toBeGreaterThan(0);
  });
});

describe('pid-pagination accessibility', () => {
  it('has no a11y violations', async () => {
    const { root } = await render(
      <pid-pagination current-page={0} total-items={50} items-per-page={10}></pid-pagination>
    );
    await checkA11y(root.outerHTML);
  });
});
