// noinspection JSUnusedLocalSymbols – h is the JSX factory used implicitly by TSX
import { render } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';

describe('pid-actions e2e', () => {
  /**
   * Helper to set actions on the pid-actions component,
   * since the actions prop accepts an array of FoldableAction objects
   * which cannot be passed as HTML attributes.
   */
  async function renderWithActions(
    actions: Array<{ priority: number; title: string; link: string; style: string }>,
  ) {
    const { root, waitForChanges } = await render(<pid-actions />);

    // Set the actions property programmatically since it's an object array
    root.actions = actions.map((a) => ({
      get priority() {
        return a.priority;
      },
      get title() {
        return a.title;
      },
      get link() {
        return a.link;
      },
      get style() {
        return a.style;
      },
      equals(other: any) {
        return a.priority === other.priority && a.title === other.title && a.link === other.link && a.style === other.style;
      },
    }));
    await waitForChanges();

    return { root, waitForChanges };
  }

  it('renders and gets hydrated class', async () => {
    const { root } = await render(<pid-actions />);
    expect(root).toHaveClass('hydrated');
  });

  it('renders nothing when no actions provided', async () => {
    const { root, waitForChanges } = await render(<pid-actions />);
    await waitForChanges();

    const toolbar = root.querySelector('[role="toolbar"]');
    expect(toolbar).toBeNull();
  });

  it('renders actions with correct structure', async () => {
    const { root } = await renderWithActions([
      { priority: 1, title: 'View Details', link: 'https://example.com/details', style: 'primary' },
      { priority: 2, title: 'Download', link: 'https://example.com/download', style: 'secondary' },
    ]);

    const toolbar = root.querySelector('[role="toolbar"]');
    expect(toolbar).not.toBeNull();

    const links = root.querySelectorAll('a');
    expect(links.length).toBe(2);
  });

  it('action links have correct href', async () => {
    const { root } = await renderWithActions([
      { priority: 1, title: 'View Source', link: 'https://example.com/source', style: 'primary' },
    ]);

    const link = root.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.com/source');
  });

  it('has ARIA toolbar role', async () => {
    const { root } = await renderWithActions([
      { priority: 1, title: 'Action', link: 'https://example.com', style: 'primary' },
    ]);

    const toolbar = root.querySelector('[role="toolbar"]');
    expect(toolbar).not.toBeNull();

    const ariaLabel = toolbar?.getAttribute('aria-label');
    expect(ariaLabel).toBe('Available actions');
  });

  it('action links open in new tab', async () => {
    const { root } = await renderWithActions([
      { priority: 1, title: 'External', link: 'https://example.com', style: 'primary' },
    ]);

    const link = root.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toContain('noopener');
  });

  it('action links have accessible aria-label with new tab indicator', async () => {
    const { root } = await renderWithActions([
      { priority: 1, title: 'View Details', link: 'https://example.com', style: 'primary' },
    ]);

    const link = root.querySelector('a');
    const ariaLabel = link?.getAttribute('aria-label');
    expect(ariaLabel).toContain('View Details');
    expect(ariaLabel).toContain('opens in new tab');
  });

  it('renders action titles as text', async () => {
    const { root } = await renderWithActions([
      { priority: 1, title: 'Resolve DOI', link: 'https://doi.org/test', style: 'primary' },
      { priority: 2, title: 'View Metadata', link: 'https://example.com', style: 'secondary' },
    ]);

    const links = root.querySelectorAll('a');
    expect(links[0].textContent).toContain('Resolve DOI');
    expect(links[1].textContent).toContain('View Metadata');
  });

  it('has sr-only description for screen readers', async () => {
    const { root } = await renderWithActions([
      { priority: 1, title: 'Test', link: 'https://example.com', style: 'primary' },
    ]);

    const srOnly = root.querySelector('.sr-only');
    expect(srOnly).not.toBeNull();
    expect(srOnly?.textContent).toContain('new tabs');
  });
});
