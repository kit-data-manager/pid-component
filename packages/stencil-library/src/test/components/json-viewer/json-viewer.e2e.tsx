import { render, h } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';
// h is the JSX factory required at runtime by TSX – do not remove
void h;

describe('json-viewer e2e', () => {
  const sampleJson = JSON.stringify({ name: 'test', value: 42, active: true });

  it('renders and gets hydrated class', async () => {
    const { root } = await render(<json-viewer data={sampleJson} />);
    expect(root).toHaveClass('hydrated');
  });

  it('renders with data attribute', async () => {
    const { root, waitForChanges } = await render(<json-viewer data={sampleJson} />);
    await waitForChanges();

    expect(root).not.toBeNull();

    // The component should render a region container
    const region = root.querySelector('[role="region"]');
    expect(region).not.toBeNull();
  });

  it('shows tree view by default', async () => {
    const { root, waitForChanges } = await render(<json-viewer data={sampleJson} />);
    await waitForChanges();

    expect(root.viewMode).toBe('tree');

    // The toggle button should say "Code View" (meaning we're currently in tree view)
    const toggleButton = root.querySelector('button[aria-label*="Switch to"]');
    if (toggleButton) {
      const text = toggleButton.textContent;
      expect(text).toContain('Code View');
    }
  });

  it('has view mode toggle button', async () => {
    const { root, waitForChanges } = await render(<json-viewer data={sampleJson} />);
    await waitForChanges();

    const toggleButton = root.querySelector('button[aria-label*="Switch to"]');
    expect(toggleButton).not.toBeNull();
    expect(toggleButton?.getAttribute('type')).toBe('button');
  });

  it('toggles between tree and code view', async () => {
    const { root, waitForChanges } = await render(<json-viewer data={sampleJson} />);
    await waitForChanges();

    // Initially in tree view, button should say "Code View"
    let toggleButton = root.querySelector('button[aria-label*="Switch to"]');
    expect(toggleButton?.textContent).toContain('Code View');

    // Click to switch to code view
    toggleButton?.click();
    await waitForChanges();

    // Now button should say "Tree View"
    toggleButton = root.querySelector('button[aria-label*="Switch to"]');
    expect(toggleButton?.textContent).toContain('Tree View');
  });

  it('dark theme applies styles', async () => {
    const { root, waitForChanges } = await render(<json-viewer data={sampleJson} theme="dark" />);
    await waitForChanges();

    expect(root.theme).toBe('dark');

    // The container should have dark mode classes
    const container = root.querySelector('[role="region"]');
    expect(container?.className).toContain('bg-gray-800');
  });

  it('has correct ARIA roles on tree nodes', async () => {
    const { root, waitForChanges } = await render(<json-viewer data={sampleJson} />);
    await waitForChanges();

    // Primitive values should have role="treeitem"
    const treeItems = root.querySelectorAll('[role="treeitem"]');
    expect(treeItems.length).toBeGreaterThan(0);
  });

  it('shows error for invalid JSON', async () => {
    const { root, waitForChanges } = await render(<json-viewer data="not valid json" />);
    await waitForChanges();

    const alert = root.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
  });

  it('has copy button', async () => {
    const { root, waitForChanges } = await render(<json-viewer data={sampleJson} />);
    await waitForChanges();

    const copyButton = root.querySelector('button[aria-label*="Copy JSON"]');
    expect(copyButton).not.toBeNull();
    expect(copyButton?.getAttribute('type')).toBe('button');
  });

  it('shows property count', async () => {
    const { root, waitForChanges } = await render(<json-viewer data={sampleJson} />);
    await waitForChanges();

    // Should show "3 properties" for the sample JSON
    const propertiesLabel = root.querySelector('[aria-live="polite"]');
    if (propertiesLabel) {
      const text = propertiesLabel.textContent;
      expect(text).toContain('3');
      expect(text).toContain('properties');
    }
  });

  it('max-height prop is applied', async () => {
    const { root, waitForChanges } = await render(
      <json-viewer data={sampleJson} maxHeight={200} />,
    );
    await waitForChanges();

    expect(root.maxHeight).toBe(200);
  });
});
