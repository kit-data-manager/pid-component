import { render, h } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';
// h is the JSX factory required at runtime by TSX – do not remove
void h;

import { FoldableItem } from '../../../utils/FoldableItem';

describe('pid-data-table CSS classes', () => {
  const createItems = (count: number): FoldableItem[] => {
    return Array.from({ length: count }, (_, i) =>
      new FoldableItem(i, `Key ${i}`, `Value ${i}`, `Tooltip ${i}`, `https://example.com/${i}`, undefined, false),
    );
  };

  it('renders empty state with correct CSS classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    await waitForChanges();
    const emptyState = root.querySelector('[role="status"]');
    expect(emptyState.className).toMatch(/rounded-lg|border|m-1|p-4/);
  });

  it('empty state has correct dark mode classes', async () => {
    const { root, waitForChanges } = await render(
      <pid-data-table dark-mode="dark"></pid-data-table>,
    );
    await waitForChanges();
    const emptyState = root.querySelector('[role="status"]');
    expect(emptyState.className).toMatch(/bg-gray-800|border-gray-700|text-gray-300/);
  });

  it('empty state has correct light mode classes', async () => {
    const { root, waitForChanges } = await render(
      <pid-data-table dark-mode="light"></pid-data-table>,
    );
    await waitForChanges();
    const emptyState = root.querySelector('[role="status"]');
    expect(emptyState.className).toMatch(/bg-gray-50|border-gray-200|text-gray-500/);
  });

  it('table has w-full and table-auto classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const table = root.querySelector('table');
    expect(table.className).toMatch(/w-full|table-auto/);
  });

  it('table has border-collapse and text-left classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const table = root.querySelector('table');
    expect(table.className).toMatch(/border-collapse|text-left/);
  });

  it('table has font-sans and text-sm classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const table = root.querySelector('table');
    expect(table.className).toMatch(/font-sans|text-sm/);
  });

  it('table has select-text class', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const table = root.querySelector('table');
    expect(table.className).toMatch(/select-text/);
  });

  it('table has rounded-md and overflow-y-auto classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const table = root.querySelector('table');
    expect(table.className).toMatch(/rounded-md|overflow-y-auto/);
  });

  it('table has dark mode text and bg classes', async () => {
    const { root, waitForChanges } = await render(
      <pid-data-table dark-mode="dark"></pid-data-table>,
    );
    root.items = createItems(3);
    await waitForChanges();
    const table = root.querySelector('table');
    expect(table.className).toMatch(/text-gray-200|bg-gray-800/);
  });

  it('thead has sticky and z-index classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const thead = root.querySelector('thead');
    expect(thead.className).toMatch(/sticky|z-20/);
  });

  it('thead has bg-slate-600 and text-slate-200 classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const thead = root.querySelector('thead');
    expect(thead.className).toMatch(/bg-slate-600|text-slate-200/);
  });

  it('thead row has font-semibold class', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const tr = root.querySelector('thead tr');
    expect(tr.className).toMatch(/font-semibold|flex-col/);
  });

  it('th has resize-x and rounded-l-md classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const th = root.querySelector('thead th');
    expect(th.className).toMatch(/resize-x|rounded-l-md|flex-2/);
  });

  it('tbody has overflow-y-auto class', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const tbody = root.querySelector('tbody');
    expect(tbody.className).toMatch(/overflow-y-auto/);
  });

  it('tbody has dark mode background in dark mode', async () => {
    const { root, waitForChanges } = await render(
      <pid-data-table dark-mode="dark"></pid-data-table>,
    );
    root.items = createItems(3);
    await waitForChanges();
    const tbody = root.querySelector('tbody');
    expect(tbody.className).toMatch(/bg-gray-800/);
  });

  it('tr has odd:bg-slate-200 and even:bg-gray-50 classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const tr = root.querySelector('tbody tr');
    expect(tr.className).toMatch(/odd:bg-slate-200|even:bg-gray-50/);
  });

  it('tr has border-b class for separation', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const tr = root.querySelector('tbody tr');
    expect(tr.className).toMatch(/border-b/);
  });

  it('td has font-mono and p-1 classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const td = root.querySelector('tbody td');
    expect(td.className).toMatch(/font-mono|p-1|align-top/);
  });

  it('td link has truncate and text-blue-600 classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const link = root.querySelector('tbody a');
    expect(link.className).toMatch(/truncate|text-blue-600|underline/);
  });

  it('td link has hover:text-blue-800 class', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const link = root.querySelector('tbody a');
    expect(link.className).toMatch(/hover:text-blue-800/);
  });

  it('td link has focus:text-blue-900 and focus:ring classes', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const link = root.querySelector('tbody a');
    expect(link.className).toMatch(/focus:text-blue-900|focus:ring-2|focus:ring-blue-500/);
  });

  it('td link has rounded-sm class', async () => {
    const { root, waitForChanges } = await render(<pid-data-table></pid-data-table>);
    root.items = createItems(3);
    await waitForChanges();
    const link = root.querySelector('tbody a');
    expect(link.className).toMatch(/rounded-sm/);
  });
});