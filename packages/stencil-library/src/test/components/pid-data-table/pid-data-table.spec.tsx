import { newSpecPage } from '@stencil/core/testing';
import { PidDataTable } from '../../../components/pid-data-table/pid-data-table';
import { FoldableItem } from '../../../utils/FoldableItem';
import { checkA11y } from '../../axe-helper';

describe('pid-data-table', () => {
  const createItems = (count: number): FoldableItem[] => {
    return Array.from({ length: count }, (_, i) =>
      new FoldableItem(i, `Key ${i}`, `Value ${i}`, `Tooltip ${i}`, `https://example.com/${i}`, undefined, false),
    );
  };

  it('renders with items prop', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    page.rootInstance.items = createItems(3);
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();
    expect(page.root).toBeTruthy();
    expect(page.root.tagName).toBe('PID-DATA-TABLE');
  });

  it('shows correct number of rows', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    page.rootInstance.items = createItems(5);
    page.rootInstance.itemsPerPage = 10;
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();
    const rows = page.root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(5);
  });

  it('handles empty items array', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    // Default items is []
    const noDataDiv = page.root.querySelector('[aria-label="No data available"]');
    expect(noDataDiv).toBeTruthy();
    expect(noDataDiv.textContent).toContain('No data available');
  });

  it('has correct default props', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    const instance = page.rootInstance;
    expect(instance.itemsPerPage).toBe(10);
    expect(instance.currentPage).toBe(0);
    expect(instance.loadSubcomponents).toBe(false);
    expect(instance.hideSubcomponents).toBe(false);
    expect(instance.darkMode).toBe('system');
  });

  it('paginates items correctly', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    page.rootInstance.items = createItems(15);
    page.rootInstance.itemsPerPage = 5;
    page.rootInstance.currentPage = 0;
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();
    const rows = page.root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(5);
  });

  it('renders table headers', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    page.rootInstance.items = createItems(2);
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();
    const headers = page.root.querySelectorAll('th');
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toContain('Key');
    expect(headers[1].textContent).toContain('Value');
  });

  it('renders pid-tooltip for items with keyTooltip', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    const items = [
      new FoldableItem(0, 'DOI', '10.1234/test', 'Digital Object Identifier', 'https://doi.org', undefined, false),
    ];
    page.rootInstance.items = items;
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    const tooltips = page.root.querySelectorAll('pid-tooltip');
    expect(tooltips.length).toBe(1);
    expect(tooltips[0].getAttribute('text')).toBe('Digital Object Identifier');
  });

  it('renders default tooltip text when keyTooltip is not provided', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    const items = [
      new FoldableItem(0, 'MyKey', 'some-value', undefined, 'https://example.com', undefined, false),
    ];
    page.rootInstance.items = items;
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    const tooltip = page.root.querySelector('pid-tooltip');
    expect(tooltip).toBeTruthy();
    // When keyTooltip is undefined, it should use fallback: `Details for ${keyTitle}`
    expect(tooltip.getAttribute('text')).toBe('Details for MyKey');
  });

  it('renders copy-button for each row', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    page.rootInstance.items = createItems(3);
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    const copyButtons = page.root.querySelectorAll('copy-button');
    expect(copyButtons.length).toBe(3);
  });

  it('copy-button receives the correct value for each row', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    page.rootInstance.items = createItems(2);
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    const copyButtons = page.root.querySelectorAll('copy-button');
    expect(copyButtons[0].getAttribute('value')).toBe('Value 0');
    expect(copyButtons[1].getAttribute('value')).toBe('Value 1');
  });

  it('renders pid-component for dynamically rendered items when loadSubcomponents is true', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    const items = [
      new FoldableItem(0, 'Sub', 'sub-value', 'Tooltip', 'https://example.com', undefined, true),
    ];
    page.rootInstance.items = items;
    page.rootInstance.loadSubcomponents = true;
    page.rootInstance.hideSubcomponents = false;
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    const pidComponents = page.root.querySelectorAll('pid-component');
    expect(pidComponents.length).toBe(1);
    expect(pidComponents[0].getAttribute('value')).toBe('sub-value');
  });

  it('renders text value for non-dynamic items', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    const items = [
      new FoldableItem(0, 'Plain', 'plain-value', 'Tooltip', 'https://example.com', undefined, false),
    ];
    page.rootInstance.items = items;
    page.rootInstance.loadSubcomponents = true;
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    // Should NOT render pid-component for non-dynamic items
    const pidComponents = page.root.querySelectorAll('pid-component');
    expect(pidComponents.length).toBe(0);
    // Should render as plain text
    const textSpan = page.root.querySelector('span.font-mono');
    expect(textSpan).toBeTruthy();
    expect(textSpan.textContent).toBe('plain-value');
  });

  it('second page shows correct items', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    page.rootInstance.items = createItems(15);
    page.rootInstance.itemsPerPage = 5;
    page.rootInstance.currentPage = 1;
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    const rows = page.root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(5);
    // Second page items should start from index 5
    const firstRowLink = rows[0].querySelector('a');
    expect(firstRowLink.textContent).toBe('Key 5');
  });

  it('last page shows remaining items', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    page.rootInstance.items = createItems(12);
    page.rootInstance.itemsPerPage = 5;
    page.rootInstance.currentPage = 2; // Third page
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    const rows = page.root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2); // Only 2 remaining items
  });

  it('resets page when current page exceeds max pages', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    page.rootInstance.items = createItems(10);
    page.rootInstance.itemsPerPage = 5;
    page.rootInstance.currentPage = 5; // Way beyond available pages
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    // Should reset to max valid page (1)
    expect(page.rootInstance.currentPage).toBe(1);
  });

  it('renders table with correct ARIA attributes', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    page.rootInstance.items = createItems(2);
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    const table = page.root.querySelector('table');
    expect(table).toBeTruthy();
    expect(table.getAttribute('role')).toBe('table');
    expect(table.getAttribute('aria-label')).toContain('Data table');
  });

  it('dark mode applies dark background classes', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table dark-mode="dark"></pid-data-table>',
    });
    page.rootInstance.items = createItems(2);
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    const tbody = page.root.querySelector('tbody');
    expect(tbody.className).toContain('bg-gray-800');
  });

  it('key links have correct href and target attributes', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    const items = [
      new FoldableItem(0, 'Link Key', 'val', 'tooltip', 'https://example.com/link', undefined, false),
    ];
    page.rootInstance.items = items;
    page.rootInstance.updateFilteredItems();
    await page.waitForChanges();

    const link = page.root.querySelector('a');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://example.com/link');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});

describe('pid-data-table accessibility', () => {
  it('has no a11y violations (empty state)', async () => {
    const page = await newSpecPage({
      components: [PidDataTable],
      html: '<pid-data-table></pid-data-table>',
    });
    // Test empty state which avoids custom element ARIA issues
    await checkA11y(page.root.outerHTML);
  });
});
