import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@stencil/vitest';

import '../pid-actions';

// Mock window.matchMedia
const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('pid-actions source', () => {
  beforeEach(() => {
    window.matchMedia = mockMatchMedia;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with empty actions', async () => {
    const { root } = await render(<pid-actions actions={[]}></pid-actions>);
    expect(root).toBeTruthy();
    expect(root.children.length).toBe(0);
  });

  it('renders with empty array', async () => {
    const { root } = await render(<pid-actions actions={[]}></pid-actions>);
    expect(root).toBeTruthy();
    expect(root.children.length).toBe(0);
  });

  it('renders with actionsId prop', async () => {
    const actions = [{ title: 'Test', url: 'https://example.com', style: 'primary' as const }];
    const { root } = await render(
      <pid-actions actions={actions} actionsId="custom-id"></pid-actions>,
    );
    expect(root).toBeTruthy();
    const container = root.querySelector('div');
    expect(container?.id).toBe('custom-id');
  });

  it('renders with dark mode prop', async () => {
    const actions = [{ title: 'Test', url: 'https://example.com', style: 'primary' as const }];
    const { root } = await render(<pid-actions actions={actions} dark-mode="dark"></pid-actions>);
    expect(root).toBeTruthy();
  });

  it('renders with light mode prop', async () => {
    const actions = [{ title: 'Test', url: 'https://example.com', style: 'primary' as const }];
    const { root } = await render(<pid-actions actions={actions} dark-mode="light"></pid-actions>);
    expect(root).toBeTruthy();
  });

  it('renders with system mode prop', async () => {
    const actions = [{ title: 'Test', url: 'https://example.com', style: 'primary' as const }];
    const { root } = await render(<pid-actions actions={actions} dark-mode="system"></pid-actions>);
    expect(root).toBeTruthy();
  });

  it('renders action with primary style', async () => {
    const actions = [{ title: 'Open', url: 'https://example.com', style: 'primary' as const }];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    expect(root).toBeTruthy();
    const link = root.querySelector('a');
    expect(link?.textContent).toContain('Open');
  });

  it('renders action with secondary style', async () => {
    const actions = [{ title: 'View', url: 'https://example.com', style: 'secondary' as const }];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    expect(root).toBeTruthy();
    const link = root.querySelector('a');
    expect(link?.textContent).toContain('View');
  });

  it('renders action with danger style', async () => {
    const actions = [{ title: 'Delete', url: 'https://example.com', style: 'danger' as const }];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    expect(root).toBeTruthy();
    const link = root.querySelector('a');
    expect(link?.textContent).toContain('Delete');
  });

  it('renders action with default style', async () => {
    const actions = [{ title: 'Info', url: 'https://example.com' }];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    expect(root).toBeTruthy();
    const link = root.querySelector('a');
    expect(link?.textContent).toContain('Info');
  });

  it('renders multiple actions', async () => {
    const actions = [
      { title: 'Open', url: 'https://example.com', style: 'primary' as const },
      { title: 'View', url: 'https://example.org', style: 'secondary' as const },
    ];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    expect(root).toBeTruthy();
    const links = root.querySelectorAll('a');
    expect(links.length).toBe(2);
  });

  it('has aria-label on container', async () => {
    const actions = [{ title: 'Test', url: 'https://example.com' }];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    const container = root.querySelector('div');
    expect(container?.getAttribute('aria-label')).toBe('Available actions');
  });

  it('has sr-only description', async () => {
    const actions = [{ title: 'Test', url: 'https://example.com' }];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    const srSpan = root.querySelector('.sr-only');
    expect(srSpan).toBeTruthy();
  });

  it('has sticky container', async () => {
    const actions = [{ title: 'Test', url: 'https://example.com' }];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    const container = root.querySelector('div');
    expect(container?.className).toContain('sticky');
  });

  it('has z-index class', async () => {
    const actions = [{ title: 'Test', url: 'https://example.com' }];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    const container = root.querySelector('div');
    expect(container?.className).toContain('z-20');
  });

  it('has link element for action', async () => {
    const actions = [{ title: 'Test', url: 'https://example.com/path' }];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    const link = root.querySelector('a');
    expect(link).toBeTruthy();
  });

  it('renders action links in flex container', async () => {
    const actions = [{ title: 'Test', url: 'https://example.com' }];
    const { root } = await render(<pid-actions actions={actions}></pid-actions>);
    const flexContainer = root.querySelector('.flex');
    expect(flexContainer).toBeTruthy();
  });

  it('handles dark mode with system preference', async () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
    }));
    const actions = [{ title: 'Test', url: 'https://example.com' }];
    const { root } = await render(<pid-actions actions={actions} dark-mode="system"></pid-actions>);
    expect(root).toBeTruthy();
  });
});
