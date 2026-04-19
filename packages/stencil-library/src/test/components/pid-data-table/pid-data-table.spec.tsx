// noinspection JSUnusedLocalSymbols – h is the JSX factory used implicitly by TSX
import { render } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';
import { FoldableItem } from '../../../utils/FoldableItem';

/**
 * NOTE: In Stencil's mock-doc lazy-loaded environment, non-shadow components
 * do NOT render their template children into the DOM. This means
 * root.querySelector('table'), root.querySelector('tbody tr'), etc. return null.
 *
 * @Watch methods (updateFilteredItems) are NOT callable externally - they are
 * triggered internally when watched props change.
 *
 * @State properties (filteredItems) are NOT accessible from outside.
 *
 * Tests verify:
 * 1. @Prop values are accessible on the element (items, itemsPerPage, currentPage, etc.)
 * 2. Props can be set and read back
 * 3. Component renders without errors
 */

describe('pid-data-table', () => {
  const createItems = (count: number): FoldableItem[] => {
    return Array.from({ length: count }, (_, i) =>
      new FoldableItem(i, `Key ${i}`, `Value ${i}`, `Tooltip ${i}`, `https://example.com/${i}`, undefined, false),
    );
  };

  it('renders with items prop', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-DATA-TABLE');
  });

  it('items prop is set correctly', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = createItems(5);
    root.items = items;
    root.itemsPerPage = 10;
    await waitForChanges();
    expect(root.items.length).toBe(5);
  });

  it('handles empty items array', async () => {
    const { root } = await render(<pid-data-table></pid-data-table>);
    // Default items is []
    expect(root.items).toEqual([]);
    // Internal content (no data div) is not accessible in mock-doc
  });

  it('has correct default props', async () => {
    const { root } = await render(<pid-data-table></pid-data-table>);
    expect(root.itemsPerPage).toBe(10);
    expect(root.currentPage).toBe(0);
    expect(root.loadSubcomponents).toBe(false);
    expect(root.hideSubcomponents).toBe(false);
    expect(root.darkMode).toBe('system');
  });

  it('paginates items correctly via prop values', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(15);
    root.itemsPerPage = 5;
    root.currentPage = 0;
    await waitForChanges();
    // filteredItems is @State (not accessible from outside).
    // Verify the props were set correctly.
    expect(root.items.length).toBe(15);
    expect(root.itemsPerPage).toBe(5);
    expect(root.currentPage).toBe(0);
  });

  it('items with tooltips render without errors', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = [
      new FoldableItem(0, 'DOI', '10.1234/test', 'Digital Object Identifier', 'https://doi.org', undefined, false),
    ];
    root.items = items;
    await waitForChanges();
    expect(root.items.length).toBe(1);
    expect(root.items[0].keyTooltip).toBe('Digital Object Identifier');
  });

  it('items without keyTooltip are handled', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = [
      new FoldableItem(0, 'MyKey', 'some-value', undefined, 'https://example.com', undefined, false),
    ];
    root.items = items;
    await waitForChanges();
    expect(root.items[0].keyTooltip).toBeUndefined();
    // The component internally uses fallback: `Details for ${keyTitle}`
  });

  it('items with renderDynamically flag are stored correctly', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = [
      new FoldableItem(0, 'Sub', 'sub-value', 'Tooltip', 'https://example.com', undefined, true),
    ];
    root.items = items;
    root.loadSubcomponents = true;
    root.hideSubcomponents = false;
    await waitForChanges();
    expect(root.items[0].renderDynamically).toBe(true);
    expect(root.loadSubcomponents).toBe(true);
  });

  it('non-dynamic items have renderDynamically false', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = [
      new FoldableItem(0, 'Plain', 'plain-value', 'Tooltip', 'https://example.com', undefined, false),
    ];
    root.items = items;
    root.loadSubcomponents = true;
    await waitForChanges();
    expect(root.items[0].renderDynamically).toBe(false);
  });

  it('second page props are set correctly', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(15);
    root.itemsPerPage = 5;
    root.currentPage = 1;
    await waitForChanges();
    expect(root.currentPage).toBe(1);
    // The @Watch handler updateFilteredItems will filter items internally
  });

  it('last page props are set correctly', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(12);
    root.itemsPerPage = 5;
    root.currentPage = 2; // Third page
    await waitForChanges();
    expect(root.currentPage).toBe(2);
    // 12 items / 5 per page = 3 pages (0, 1, 2)
    // Last page has 2 items (internally computed)
  });

  it('resets page when current page exceeds max pages', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(10);
    root.itemsPerPage = 5;
    root.currentPage = 5; // Way beyond available pages (max is 1)
    await waitForChanges();
    // The @Watch handler updateFilteredItems resets currentPage internally.
    // currentPage is @Prop({ mutable: true }) so it should be updated.
    expect(root.currentPage).toBe(1);
  });

  it('items have correct keyLink values', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    const items = [
      new FoldableItem(0, 'Link Key', 'val', 'tooltip', 'https://example.com/link', undefined, false),
    ];
    root.items = items;
    await waitForChanges();
    expect(root.items[0].keyLink).toBe('https://example.com/link');
  });

  it('dark mode prop can be set', async () => {
    const { root, waitForChanges } = await render(<pid-data-table dark-mode="dark"></pid-data-table>);
    root.items = createItems(2);
    await waitForChanges();
    expect(root.darkMode).toBe('dark');
  });

  it('pageSizes has correct default', async () => {
    const { root } = await render(<pid-data-table></pid-data-table>);
    expect(root.pageSizes).toEqual([5, 10, 25, 50, 100]);
  });

  it('settings prop defaults to empty array', async () => {
    const { root } = await render(<pid-data-table></pid-data-table>);
    expect(root.settings).toBe('[]');
  });
});

describe('pid-data-table accessibility', () => {
  it('has no a11y violations (empty state)', async () => {
    const { checkA11y } = await import('../../axe-helper');
    const { root } = await render(<pid-data-table></pid-data-table>);
    await checkA11y(root.outerHTML);
  });
});
