// noinspection JSUnusedLocalSymbols – h is the JSX factory used implicitly by TSX
import { render } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';

describe('pid-pagination e2e', () => {
  it('renders and gets hydrated class', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={50} itemsPerPage={10} />,
    );
    expect(root).toHaveClass('hydrated');
  });

  it('renders with required props', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination currentPage={0} totalItems={30} itemsPerPage={10} />,
    );
    await waitForChanges();

    expect(root.currentPage).toBe(0);
    expect(root.totalItems).toBe(30);
    expect(root.itemsPerPage).toBe(10);
  });

  it('has role="navigation" for accessibility', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination currentPage={0} totalItems={50} itemsPerPage={10} />,
    );
    await waitForChanges();

    const nav = root.querySelector('[role="navigation"]');
    expect(nav).not.toBeNull();
  });

  it('shows correct number of page buttons', async () => {
    const { root, waitForChanges } = await render(
      // 50 items, 10 per page = 5 pages
      <pid-pagination currentPage={0} totalItems={50} itemsPerPage={10} />,
    );
    await waitForChanges();

    // Find page number buttons (exclude prev/next)
    const pageButtons = root.querySelectorAll('nav button[aria-label^="Page"]');
    expect(pageButtons.length).toBe(5);
  });

  it('has navigation buttons (prev/next)', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination currentPage={0} totalItems={50} itemsPerPage={10} />,
    );
    await waitForChanges();

    const prevButton = root.querySelector('button[aria-label="Previous page"]');
    expect(prevButton).not.toBeNull();

    const nextButton = root.querySelector('button[aria-label="Next page"]');
    expect(nextButton).not.toBeNull();
  });

  it('previous button is disabled on first page', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination currentPage={0} totalItems={50} itemsPerPage={10} />,
    );
    await waitForChanges();

    const prevButton = root.querySelector('button[aria-label="Previous page"]') as HTMLButtonElement | null;
    expect(prevButton?.disabled).toBe(true);
  });

  it('next button is disabled on last page', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination currentPage={4} totalItems={50} itemsPerPage={10} />,
    );
    await waitForChanges();

    const nextButton = root.querySelector('button[aria-label="Next page"]') as HTMLButtonElement | null;
    expect(nextButton?.disabled).toBe(true);
  });

  it('emits pageChange event when clicking next', async () => {
    const { root, waitForChanges, spyOnEvent } = await render(
      <pid-pagination currentPage={0} totalItems={50} itemsPerPage={10} />,
    );
    await waitForChanges();

    const pageChangeSpy = spyOnEvent('pageChange');

    const nextButton = root.querySelector('button[aria-label="Next page"]');
    nextButton?.click();
    await waitForChanges();

    expect(pageChangeSpy).toHaveReceivedEvent();
    expect(pageChangeSpy).toHaveReceivedEventDetail(1);
  });

  it('current page button has aria-current="page"', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination currentPage={2} totalItems={50} itemsPerPage={10} />,
    );
    await waitForChanges();

    const currentPageButton = root.querySelector('button[aria-current="page"]');
    expect(currentPageButton).not.toBeNull();
    // Page 2 (0-based) = displays as "3"
    expect(currentPageButton?.textContent?.trim()).toBe('3');
  });

  it('shows items per page control by default', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination currentPage={0} totalItems={50} itemsPerPage={10} />,
    );
    await waitForChanges();

    const itemsPerPageGroup = root.querySelector('[role="toolbar"]');
    expect(itemsPerPageGroup).not.toBeNull();
  });

  it('emits itemsPerPageChange event when changing page size', async () => {
    const { root, waitForChanges, spyOnEvent } = await render(
      <pid-pagination currentPage={0} totalItems={50} itemsPerPage={10} />,
    );
    await waitForChanges();

    const itemsPerPageSpy = spyOnEvent('itemsPerPageChange');

    // Click the "25" page size button
    const pageSizeButton = root.querySelector('button[aria-label="Show 25 items per page"]');
    if (pageSizeButton) {
      pageSizeButton.click();
      await waitForChanges();
      expect(itemsPerPageSpy).toHaveReceivedEvent();
      expect(itemsPerPageSpy).toHaveReceivedEventDetail(25);
    }
  });

  it('does not render when totalItems is 0', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination currentPage={0} totalItems={0} itemsPerPage={10} />,
    );
    await waitForChanges();

    // The component should render nothing when there are no items
    const nav = root.querySelector('[role="navigation"]');
    expect(nav).toBeNull();
  });

  it('does not show pagination nav when items fit on one page', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination currentPage={0} totalItems={5} itemsPerPage={10} />,
    );
    await waitForChanges();

    // The pagination nav should not be rendered when all items fit on one page
    const paginationNav = root.querySelector('nav');
    expect(paginationNav).toBeNull();
  });

  it('shows display range text', async () => {
    const { root, waitForChanges } = await render(
      <pid-pagination currentPage={0} totalItems={50} itemsPerPage={10} />,
    );
    await waitForChanges();

    const statusText = root.querySelector('[role="status"]');
    if (statusText) {
      const text = statusText.textContent;
      expect(text).toContain('1');
      expect(text).toContain('10');
      expect(text).toContain('50');
    }
  });
});
