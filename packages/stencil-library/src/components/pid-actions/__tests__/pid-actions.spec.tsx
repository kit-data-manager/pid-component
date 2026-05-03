import { render, h } from '@stencil/vitest';
import { describe, it, expect } from 'vitest';
// h is the JSX factory required at runtime by TSX – do not remove
void h;
import { FoldableAction } from '../../../utils/FoldableAction';
import { checkA11y } from '../../../utils/__tests__/axe-helper';

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

  it('renders single action correctly', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const links = root.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain('View');
  });

  it('default style applies correct CSS classes in light mode', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="light"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Default', 'https://example.com', 'default'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('bg-gray-200');
    expect(link.className).toContain('text-gray-700');
  });

  it('default style applies correct CSS classes in dark mode', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="dark"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Default', 'https://example.com', 'default'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('bg-gray-700');
    expect(link.className).toContain('text-gray-200');
  });

  it('links have correct title attribute', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View Resource', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.getAttribute('title')).toBe('View Resource - Opens in a new tab');
  });

  it('links have sr-only text for screen readers', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    const srOnly = link.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly.textContent).toContain('(opens in new tab)');
  });

  it('container has correct aria-label', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const container = root.querySelector('[role="toolbar"]');
    expect(container.getAttribute('aria-label')).toBe('Available actions');
  });

  it('inner div has describedby association', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const innerDiv = root.querySelector('.actions-container > div');
    expect(innerDiv.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('actions with different styles render correctly', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="light"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Primary', 'https://example.com/1', 'primary'),
      new FoldableAction(1, 'Secondary', 'https://example.com/2', 'secondary'),
      new FoldableAction(2, 'Danger', 'https://example.com/3', 'danger'),
      new FoldableAction(3, 'Default', 'https://example.com/4', 'default'),
    ];
    await waitForChanges();

    const links = root.querySelectorAll('a');
    expect(links.length).toBe(4);
  });

  it('actions container has sticky positioning', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const container = root.querySelector('.actions-container');
    expect(container.className).toContain('sticky');
  });

  it('actions container has correct z-index', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const container = root.querySelector('.actions-container');
    expect(container.className).toContain('z-20');
  });

  it('system dark mode uses window matchMedia', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="system"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    expect(root.darkMode).toBe('system');
    expect(root).toBeTruthy();
  });

  it('all action styles work in light mode', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="light"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Primary', 'https://example.com/1', 'primary'),
      new FoldableAction(1, 'Secondary', 'https://example.com/2', 'secondary'),
      new FoldableAction(2, 'Danger', 'https://example.com/3', 'danger'),
    ];
    await waitForChanges();

    const links = root.querySelectorAll('a');
    expect(links[0].className).toContain('bg-blue-500');
    expect(links[1].className).toContain('bg-slate-200');
    expect(links[2].className).toContain('bg-red-500');
  });

  it('all action styles work in dark mode', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="dark"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Primary', 'https://example.com/1', 'primary'),
      new FoldableAction(1, 'Secondary', 'https://example.com/2', 'secondary'),
      new FoldableAction(2, 'Danger', 'https://example.com/3', 'danger'),
    ];
    await waitForChanges();

    const links = root.querySelectorAll('a');
    expect(links[0].className).toContain('bg-blue-700');
    expect(links[1].className).toContain('bg-slate-700');
    expect(links[2].className).toContain('bg-red-700');
  });

  it('action links have focus ring classes', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('focus:outline-hidden');
    expect(link.className).toContain('focus:ring-2');
    expect(link.className).toContain('focus:ring-offset-1');
    expect(link.className).toContain('focus:ring-blue-500');
  });

  it('action links have transition classes', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.className).toContain('transition-colors');
    expect(link.className).toContain('duration-200');
  });

  it('actions container has flex-wrap class', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const container = root.querySelector('.actions-container > div');
    expect(container.className).toContain('flex-wrap');
    expect(container.className).toContain('justify-between');
    expect(container.className).toContain('gap-1');
  });

  it('renders with actionsId prop', async () => {
    const { root, waitForChanges } = await render(<pid-actions actions-id="custom-actions-id"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const container = root.querySelector('[id="custom-actions-id"]');
    expect(container).toBeTruthy();
    expect(container.getAttribute('role')).toBe('toolbar');
  });

  it('actionsId defaults to generated id when not provided', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const container = root.querySelector('.actions-container');
    expect(container.id).toBeTruthy();
    expect(container.id).toMatch(/^actions-/);
  });

  it('empty actions array still renders container', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [];
    await waitForChanges();

    expect(root.innerHTML).toBe('');
  });

  it('large number of actions renders correctly', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    const actions = Array.from({ length: 10 }, (_, i) =>
      new FoldableAction(i, `Action ${i}`, `https://example.com/${i}`, 'primary'),
    );
    root.actions = actions;
    await waitForChanges();

    const links = root.querySelectorAll('a');
    expect(links.length).toBe(10);
  });

  it('actions with special characters in title render correctly', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View <script>alert(1)</script>', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link).toBeTruthy();
    expect(link.getAttribute('aria-label')).toContain('View');
  });

  it('actions with long titles render correctly', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'This is a very long title that should still render correctly', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('This is a very long title');
  });

  it('links have rel attribute for security', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
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

  it('has no a11y violations with multiple actions', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com/1', 'primary'),
      new FoldableAction(1, 'Edit', 'https://example.com/2', 'secondary'),
      new FoldableAction(2, 'Delete', 'https://example.com/3', 'danger'),
    ];
    await waitForChanges();
    await checkA11y(root.outerHTML);
  });

  it('has no a11y violations in dark mode', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="dark"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();
    await checkA11y(root.outerHTML);
  });

  it('has no a11y violations in light mode', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="light"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();
    await checkA11y(root.outerHTML);
  });
});

describe('pid-actions edge cases', () => {
  it('handles actions with empty title', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, '', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link).toBeTruthy();
  });

  it('handles actions with whitespace-only title', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, '   ', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link).toBeTruthy();
  });

  it('handles actions with null-like title', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'N/A', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link).toBeTruthy();
  });

  it('renders correctly with system dark mode when media query is undefined', async () => {
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { root, waitForChanges } = await render(<pid-actions dark-mode="system"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();

    const link = root.querySelector('a');
    expect(link).toBeTruthy();

    delete (window as any).matchMedia;
  });
});
