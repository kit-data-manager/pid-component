import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, h } from '@stencil/vitest';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

import '../pid-pagination';

describe('pid-pagination source', () => {
  it('renders with basic props', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={100} itemsPerPage={10}></pid-pagination>,
    );
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-PAGINATION');
  });

  it('renders null when totalItems is 0', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={0} itemsPerPage={10}></pid-pagination>,
    );
    expect(root.childNodes.length).toBe(0);
  });

  it('renders null when totalItems is negative', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={-1} itemsPerPage={10}></pid-pagination>,
    );
    expect(root.childNodes.length).toBe(0);
  });

  it('renders with showItemsPerPageControl false', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={100} itemsPerPage={10}
                      showItemsPerPageControl={false}></pid-pagination>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with darkMode light', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={100} itemsPerPage={10} darkMode="light"></pid-pagination>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with darkMode dark', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={100} itemsPerPage={10} darkMode="dark"></pid-pagination>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with custom page sizes', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={100} itemsPerPage={10} pageSizes={[20, 50, 100]}></pid-pagination>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with first page active', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={100} itemsPerPage={10}></pid-pagination>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with middle page active', async () => {
    const { root } = await render(
      <pid-pagination currentPage={3} totalItems={100} itemsPerPage={10}></pid-pagination>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with last page active', async () => {
    const { root } = await render(
      <pid-pagination currentPage={9} totalItems={100} itemsPerPage={10}></pid-pagination>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with single page', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={5} itemsPerPage={10}></pid-pagination>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with exact page count', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={50} itemsPerPage={10}></pid-pagination>,
    );
    expect(root).toBeTruthy();
  });

  it('has navigation role', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={100} itemsPerPage={10}></pid-pagination>,
    );
    const nav = root.querySelector('div[role="navigation"]');
    expect(nav).toBeTruthy();
  });

  it('has hidden label for screen readers', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={100} itemsPerPage={10}></pid-pagination>,
    );
    const srOnly = root.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
  });

  it('has page size buttons', async () => {
    const { root } = await render(
      <pid-pagination currentPage={0} totalItems={100} itemsPerPage={10}></pid-pagination>,
    );
    const buttons = root.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
