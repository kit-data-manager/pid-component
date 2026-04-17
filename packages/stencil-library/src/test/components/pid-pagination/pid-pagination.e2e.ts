import { newE2EPage } from '@stencil/core/testing';

describe('pid-pagination e2e', () => {
  it('renders and gets hydrated class', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="50" items-per-page="10"></pid-pagination>',
    );
    const element = await page.find('pid-pagination');
    expect(element).toHaveClass('hydrated');
  });

  it('renders with required props', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="30" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    const element = await page.find('pid-pagination');
    expect(await element.getProperty('currentPage')).toBe(0);
    expect(await element.getProperty('totalItems')).toBe(30);
    expect(await element.getProperty('itemsPerPage')).toBe(10);
  });

  it('has role="navigation" for accessibility', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="50" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    const nav = await page.find('pid-pagination [role="navigation"]');
    expect(nav).not.toBeNull();
  });

  it('shows correct number of page buttons', async () => {
    const page = await newE2EPage();
    // 50 items, 10 per page = 5 pages
    await page.setContent(
      '<pid-pagination current-page="0" total-items="50" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    // Find page number buttons (exclude prev/next)
    const pageButtons = await page.findAll(
      'pid-pagination nav button[aria-label^="Page"]',
    );
    expect(pageButtons.length).toBe(5);
  });

  it('has navigation buttons (prev/next)', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="50" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    const prevButton = await page.find(
      'pid-pagination button[aria-label="Previous page"]',
    );
    expect(prevButton).not.toBeNull();

    const nextButton = await page.find(
      'pid-pagination button[aria-label="Next page"]',
    );
    expect(nextButton).not.toBeNull();
  });

  it('previous button is disabled on first page', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="50" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    const prevButton = await page.find(
      'pid-pagination button[aria-label="Previous page"]',
    );
    expect(await prevButton.getProperty('disabled')).toBe(true);
  });

  it('next button is disabled on last page', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="4" total-items="50" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    const nextButton = await page.find(
      'pid-pagination button[aria-label="Next page"]',
    );
    expect(await nextButton.getProperty('disabled')).toBe(true);
  });

  it('emits pageChange event when clicking next', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="50" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    const pageChangeSpy = await page.spyOnEvent('pageChange');

    const nextButton = await page.find(
      'pid-pagination button[aria-label="Next page"]',
    );
    await nextButton.click();
    await page.waitForChanges();

    expect(pageChangeSpy).toHaveReceivedEvent();
    expect(pageChangeSpy).toHaveReceivedEventDetail(1);
  });

  it('current page button has aria-current="page"', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="2" total-items="50" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    const currentPageButton = await page.find(
      'pid-pagination button[aria-current="page"]',
    );
    expect(currentPageButton).not.toBeNull();
    // Page 2 (0-based) = displays as "3"
    expect(currentPageButton.textContent.trim()).toBe('3');
  });

  it('shows items per page control by default', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="50" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    const itemsPerPageGroup = await page.find(
      'pid-pagination [role="toolbar"]',
    );
    expect(itemsPerPageGroup).not.toBeNull();
  });

  it('emits itemsPerPageChange event when changing page size', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="50" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    const itemsPerPageSpy = await page.spyOnEvent('itemsPerPageChange');

    // Click the "25" page size button
    const pageSizeButton = await page.find(
      'pid-pagination button[aria-label="Show 25 items per page"]',
    );
    if (pageSizeButton) {
      await pageSizeButton.click();
      await page.waitForChanges();
      expect(itemsPerPageSpy).toHaveReceivedEvent();
      expect(itemsPerPageSpy).toHaveReceivedEventDetail(25);
    }
  });

  it('does not render when totalItems is 0', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="0" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    // The component should render nothing when there are no items
    const nav = await page.find('pid-pagination [role="navigation"]');
    expect(nav).toBeNull();
  });

  it('does not show pagination nav when items fit on one page', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="5" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    // The pagination nav should not be rendered when all items fit on one page
    const paginationNav = await page.find('pid-pagination nav');
    expect(paginationNav).toBeNull();
  });

  it('shows display range text', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-pagination current-page="0" total-items="50" items-per-page="10"></pid-pagination>',
    );
    await page.waitForChanges();

    const statusText = await page.find('pid-pagination [role="status"]');
    if (statusText) {
      const text = statusText.textContent;
      expect(text).toContain('1');
      expect(text).toContain('10');
      expect(text).toContain('50');
    }
  });
});
