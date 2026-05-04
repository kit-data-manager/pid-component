import { describe, expect, it } from 'vitest';
import { render } from '@stencil/vitest';
import { FoldableItem } from '../../../utils/FoldableItem';

import '../pid-data-table';

describe('pid-data-table source', () => {
  const createMockItem = (): FoldableItem => ({
    _priority: 1,
    _title: 'Test Item',
    _estimatedTypePriority: 1,
    keyTitle: 'Test Key',
    priority: 1,
    title: 'Test Item',
    estimatedTypePriority: 1,
    renderPreview: () => 'Preview',
    renderBody: () => null,
    equals: function(other: FoldableItem): boolean {
      return this._priority === other._priority && this._title === other._title;
    },
    clone: function(): FoldableItem {
      return this;
    },
    isOrphan: false,
  } as unknown as FoldableItem);

  it('renders with basic props', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0}></pid-data-table>,
    );
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-DATA-TABLE');
  });

  it('renders with items', async () => {
    const items = [createMockItem()];
    const { root } = await render(
      <pid-data-table items={items} itemsPerPage={10} currentPage={0}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with empty items array', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with darkMode light', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} darkMode="light"></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with darkMode dark', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} darkMode="dark"></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with darkMode system', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} darkMode="system"></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with custom page sizes', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} pageSizes={[5, 20, 50]}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with loadSubcomponents true', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} loadSubcomponents={true}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with loadSubcomponents false', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} loadSubcomponents={false}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with hideSubcomponents true', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} hideSubcomponents={true}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with hideSubcomponents false', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} hideSubcomponents={false}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with currentLevelOfSubcomponents', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} currentLevelOfSubcomponents={1}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with levelOfSubcomponents', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} levelOfSubcomponents={3}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with custom settings', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0} settings='[{"type":"test"}]'></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('emits pageChange event', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });

  it('emits itemsPerPageChange event', async () => {
    const { root } = await render(
      <pid-data-table items={[]} itemsPerPage={10} currentPage={0}></pid-data-table>,
    );
    expect(root).toBeTruthy();
  });
});
