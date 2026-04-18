import { render, h } from '@stencil/vitest';
import { describe, it, expect } from 'vitest';
import { FoldableAction } from '../../../utils/FoldableAction';
import { checkA11y } from '../../axe-helper';

describe('pid-actions', () => {
  it('renders with actions prop', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
      new FoldableAction(1, 'Download', 'https://example.com/dl', 'secondary'),
    ];
    await waitForChanges();
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-ACTIONS');
  });

  it('shows action links', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Open Resource', 'https://example.com/resource', 'primary'),
    ];
    await waitForChanges();
    const links = root.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain('Open Resource');
    expect(links[0].getAttribute('href')).toBe('https://example.com/resource');
    expect(links[0].getAttribute('target')).toBe('_blank');
  });

  it('renders nothing when actions array is empty', async () => {
    const { root } = await render(<pid-actions></pid-actions>);
    // render returns null for empty actions (default)
    expect(root.innerHTML).toBe('');
  });

  it('has correct default darkMode', async () => {
    const { root } = await render(<pid-actions></pid-actions>);
    expect(root.darkMode).toBe('system');
  });

  it('action links have correct href attributes', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com/view', 'primary'),
      new FoldableAction(1, 'Download', 'https://example.com/download', 'secondary'),
      new FoldableAction(2, 'Delete', 'https://example.com/delete', 'danger'),
    ];
    await waitForChanges();

    const links = root.querySelectorAll('a');
    expect(links.length).toBe(3);
    expect(links[0].getAttribute('href')).toBe('https://example.com/view');
    expect(links[1].getAttribute('href')).toBe('https://example.com/download');
    expect(links[2].getAttribute('href')).toBe('https://example.com/delete');
  });

  it('all action links open in new tab', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
      new FoldableAction(1, 'Edit', 'https://example.com/edit', 'secondary'),
    ];
    await waitForChanges();

    const links = root.querySelectorAll('a');
    links.forEach(link => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  it('primary style applies blue CSS classes in light mode', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="light"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Primary Action', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('bg-blue-500');
    expect(link.className).toContain('text-white');
  });

  it('secondary style applies slate CSS classes in light mode', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="light"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Secondary Action', 'https://example.com', 'secondary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('bg-slate-200');
    expect(link.className).toContain('text-blue-500');
  });

  it('danger style applies red CSS classes in light mode', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="light"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Danger Action', 'https://example.com', 'danger'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('bg-red-500');
    expect(link.className).toContain('text-white');
  });

  it('dark mode primary style applies dark blue CSS classes', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="dark"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Primary Action', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('bg-blue-700');
    expect(link.className).toContain('text-white');
  });

  it('dark mode secondary style applies dark slate CSS classes', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="dark"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Secondary Action', 'https://example.com', 'secondary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('bg-slate-700');
    expect(link.className).toContain('text-blue-300');
  });

  it('dark mode danger style applies dark red CSS classes', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="dark"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Danger Action', 'https://example.com', 'danger'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('bg-red-700');
    expect(link.className).toContain('text-white');
  });

  it('actions render in the order provided', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'First', 'https://example.com/1', 'primary'),
      new FoldableAction(1, 'Second', 'https://example.com/2', 'secondary'),
      new FoldableAction(2, 'Third', 'https://example.com/3', 'danger'),
    ];
    await waitForChanges();

    const links = root.querySelectorAll('a');
    expect(links[0].textContent).toContain('First');
    expect(links[1].textContent).toContain('Second');
    expect(links[2].textContent).toContain('Third');
  });

  it('all links have base CSS classes', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Action', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('font-semibold');
    expect(link.className).toContain('rounded-sm');
    expect(link.className).toContain('border');
    expect(link.className).toContain('transition-colors');
  });

  it('action links have correct aria-label', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View Resource', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.getAttribute('aria-label')).toBe('View Resource (opens in new tab)');
  });

  it('container has toolbar role', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Action', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const container = root.querySelector('[role="toolbar"]');
    expect(container).toBeTruthy();
  });

  it('container has sr-only description for screen readers', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Action', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const srOnly = root.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly.textContent).toContain('open related resources in new tabs');
  });

  it('dark mode applies dark background to container', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="dark"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Action', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const container = root.querySelector('.actions-container');
    expect(container.className).toContain('bg-gray-800');
  });

  it('light mode applies light background to container', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="light"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Action', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const container = root.querySelector('.actions-container');
    expect(container.className).toContain('bg-white');
  });

  it('renders multiple actions correctly', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Action 1', 'https://example.com/1', 'primary'),
      new FoldableAction(1, 'Action 2', 'https://example.com/2', 'secondary'),
      new FoldableAction(2, 'Action 3', 'https://example.com/3', 'danger'),
      new FoldableAction(3, 'Action 4', 'https://example.com/4', 'primary'),
    ];
    await waitForChanges();

    const links = root.querySelectorAll('a');
    expect(links.length).toBe(4);
  });
});

describe('pid-actions accessibility', () => {
  it('has no a11y violations', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();
    await checkA11y(root.outerHTML);
  });
});
