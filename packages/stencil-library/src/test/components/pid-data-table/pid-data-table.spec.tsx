import { render, h } from '@stencil/vitest';
import { describe, it, expect } from 'vitest';
import { FoldableItem } from '../../../utils/FoldableItem';
import { checkA11y } from '../../axe-helper';

describe('pid-data-table', () => {
  const createItems = (count: number): FoldableItem[] => {
    return Array.from({ length: count }, (_, i) =>
      new FoldableItem(i, `Key ${i}`, `Value ${i}`, `Tooltip ${i}`, `https://example.com/${i}`, undefined, false),
    );
  };

  it('renders with items prop', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    root.updateFilteredItems();
    await waitForChanges();
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-DATA-TABLE');
  });

  it('shows correct number of rows', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(5);
    root.itemsPerPage = 10;
    root.updateFilteredItems();
    await waitForChanges();
    const rows = root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(5);
  });

  it('handles empty items array', async () => {
    const { root } = await render(<pid-data-table></pid-data-table>);
    // Default items is []
    const noDataDiv = root.querySelector('[aria-label="No data available"]');
    expect(noDataDiv).toBeTruthy();
    expect(noDataDiv.textContent).toContain('No data available');
  });

  it('has correct default props', async () => {
    const { root } = await render(<pid-data-table></pid-data-table>);
    expect(root.itemsPerPage).toBe(10);
    expect(root.currentPage).toBe(0);
    expect(root.loadSubcomponents).toBe(false);
    expect(root.hideSubcomponents).toBe(false);
    expect(root.darkMode).toBe('system');
  });

  it('paginates items correctly', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(15);
    root.itemsPerPage = 5;
    root.currentPage = 0;
    root.updateFilteredItems();
    await waitForChanges();
    const rows = root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(5);
  });

  it('renders table headers', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(2);
    root.updateFilteredItems();
    await waitForChanges();
    const headers = root.querySelectorAll('th');
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toContain('Key');
    expect(headers[1].textContent).toContain('Value');
  });

  it('renders pid-tooltip for items with keyTooltip', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = [
      new FoldableItem(0, 'DOI', '10.1234/test', 'Digital Object Identifier', 'https://doi.org', undefined, false),
    ];
    root.items = items;
    root.updateFilteredItems();
    await waitForChanges();

    const tooltips = root.querySelectorAll('pid-tooltip');
    expect(tooltips.length).toBe(1);
    expect(tooltips[0].getAttribute('text')).toBe('Digital Object Identifier');
  });

  it('renders default tooltip text when keyTooltip is not provided', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = [
      new FoldableItem(0, 'MyKey', 'some-value', undefined, 'https://example.com', undefined, false),
    ];
    root.items = items;
    root.updateFilteredItems();
    await waitForChanges();

    const tooltip = root.querySelector('pid-tooltip');
    expect(tooltip).toBeTruthy();
    // When keyTooltip is undefined, it should use fallback: `Details for ${keyTitle}`
    expect(tooltip.getAttribute('text')).toBe('Details for MyKey');
  });

  it('renders copy-button for each row', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    root.updateFilteredItems();
    await waitForChanges();

    const copyButtons = root.querySelectorAll('copy-button');
    expect(copyButtons.length).toBe(3);
  });

  it('copy-button receives the correct value for each row', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(2);
    root.updateFilteredItems();
    await waitForChanges();

    const copyButtons = root.querySelectorAll('copy-button');
    expect(copyButtons[0].getAttribute('value')).toBe('Value 0');
    expect(copyButtons[1].getAttribute('value')).toBe('Value 1');
  });

  it('renders pid-component for dynamically rendered items when loadSubcomponents is true', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = [
      new FoldableItem(0, 'Sub', 'sub-value', 'Tooltip', 'https://example.com', undefined, true),
    ];
    root.items = items;
    root.loadSubcomponents = true;
    root.hideSubcomponents = false;
    root.updateFilteredItems();
    await waitForChanges();

    const pidComponents = root.querySelectorAll('pid-component');
    expect(pidComponents.length).toBe(1);
    expect(pidComponents[0].getAttribute('value')).toBe('sub-value');
  });

  it('renders text value for non-dynamic items', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = [
      new FoldableItem(0, 'Plain', 'plain-value', 'Tooltip', 'https://example.com', undefined, false),
    ];
    root.items = items;
    root.loadSubcomponents = true;
    root.updateFilteredItems();
    await waitForChanges();

    // Should NOT render pid-component for non-dynamic items
    const pidComponents = root.querySelectorAll('pid-component');
    expect(pidComponents.length).toBe(0);
    // Should render as plain text
    const textSpan = root.querySelector('span.font-mono');
    expect(textSpan).toBeTruthy();
    expect(textSpan.textContent).toBe('plain-value');
  });

  it('second page shows correct items', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(15);
    root.itemsPerPage = 5;
    root.currentPage = 1;
    root.updateFilteredItems();
    await waitForChanges();

    const rows = root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(5);
    // Second page items should start from index 5
    const firstRowLink = rows[0].querySelector('a');
    expect(firstRowLink.textContent).toBe('Key 5');
  });

  it('last page shows remaining items', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(12);
    root.itemsPerPage = 5;
    root.currentPage = 2; // Third page
    root.updateFilteredItems();
    await waitForChanges();

    const rows = root.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2); // Only 2 remaining items
  });

  it('resets page when current page exceeds max pages', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(10);
    root.itemsPerPage = 5;
    root.currentPage = 5; // Way beyond available pages
    root.updateFilteredItems();
    await waitForChanges();

    // Should reset to max valid page (1)
    expect(root.currentPage).toBe(1);
  });

  it('renders table with correct ARIA attributes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(2);
    root.updateFilteredItems();
    await waitForChanges();

    const table = root.querySelector('table');
    expect(table).toBeTruthy();
    expect(table.getAttribute('role')).toBe('table');
    expect(table.getAttribute('aria-label')).toContain('Data table');
  });

  it('dark mode applies dark background classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table dark-mode="dark"></pid-data-table>);
    root.items = createItems(2);
    root.updateFilteredItems();
    await waitForChanges();

    const tbody = root.querySelector('tbody');
    expect(tbody.className).toContain('bg-gray-800');
  });

  it('key links have correct href and target attributes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = [
      new FoldableItem(0, 'Link Key', 'val', 'tooltip', 'https://example.com/link', undefined, false),
    ];
    root.items = items;
    root.updateFilteredItems();
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://example.com/link');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});

describe('pid-data-table accessibility', () => {
  it('has no a11y violations (empty state)', async () => {
    const { root } = await render(<pid-data-table></pid-data-table>);
    // Test empty state which avoids custom element ARIA issues
    await checkA11y(root.outerHTML);
  });
});
