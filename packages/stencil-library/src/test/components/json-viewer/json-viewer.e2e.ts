import { newE2EPage } from '@stencil/core/testing';

describe('json-viewer e2e', () => {
  const sampleJson = JSON.stringify({ name: 'test', value: 42, active: true });

  it('renders and gets hydrated class', async () => {
    const page = await newE2EPage();
    await page.setContent(`<json-viewer data='${sampleJson}'></json-viewer>`);
    const element = await page.find('json-viewer');
    expect(element).toHaveClass('hydrated');
  });

  it('renders with data attribute', async () => {
    const page = await newE2EPage();
    await page.setContent(`<json-viewer data='${sampleJson}'></json-viewer>`);
    await page.waitForChanges();

    const element = await page.find('json-viewer');
    expect(element).not.toBeNull();

    // The component should render a region container
    const region = await page.find('json-viewer [role="region"]');
    expect(region).not.toBeNull();
  });

  it('shows tree view by default', async () => {
    const page = await newE2EPage();
    await page.setContent(`<json-viewer data='${sampleJson}'></json-viewer>`);
    await page.waitForChanges();

    const element = await page.find('json-viewer');
    expect(await element.getProperty('viewMode')).toBe('tree');

    // The toggle button should say "Code View" (meaning we're currently in tree view)
    const toggleButton = await page.find('json-viewer button[aria-label*="Switch to"]');
    if (toggleButton) {
      const text = toggleButton.textContent;
      expect(text).toContain('Code View');
    }
  });

  it('has view mode toggle button', async () => {
    const page = await newE2EPage();
    await page.setContent(`<json-viewer data='${sampleJson}'></json-viewer>`);
    await page.waitForChanges();

    const toggleButton = await page.find('json-viewer button[aria-label*="Switch to"]');
    expect(toggleButton).not.toBeNull();
    expect(toggleButton.getAttribute('type')).toBe('button');
  });

  it('toggles between tree and code view', async () => {
    const page = await newE2EPage();
    await page.setContent(`<json-viewer data='${sampleJson}'></json-viewer>`);
    await page.waitForChanges();

    // Initially in tree view, button should say "Code View"
    let toggleButton = await page.find('json-viewer button[aria-label*="Switch to"]');
    expect(toggleButton.textContent).toContain('Code View');

    // Click to switch to code view
    await toggleButton.click();
    await page.waitForChanges();

    // Now button should say "Tree View"
    toggleButton = await page.find('json-viewer button[aria-label*="Switch to"]');
    expect(toggleButton.textContent).toContain('Tree View');
  });

  it('dark theme applies styles', async () => {
    const page = await newE2EPage();
    await page.setContent(`<json-viewer data='${sampleJson}' theme="dark"></json-viewer>`);
    await page.waitForChanges();

    const element = await page.find('json-viewer');
    expect(await element.getProperty('theme')).toBe('dark');

    // The container should have dark mode classes
    const container = await page.find('json-viewer [role="region"]');
    const classNames = container.className;
    expect(classNames).toContain('bg-gray-800');
  });

  it('has correct ARIA roles on tree nodes', async () => {
    const page = await newE2EPage();
    await page.setContent(`<json-viewer data='${sampleJson}'></json-viewer>`);
    await page.waitForChanges();

    // Primitive values should have role="treeitem"
    const treeItems = await page.findAll('json-viewer [role="treeitem"]');
    expect(treeItems.length).toBeGreaterThan(0);
  });

  it('shows error for invalid JSON', async () => {
    const page = await newE2EPage();
    await page.setContent(`<json-viewer data="not valid json"></json-viewer>`);
    await page.waitForChanges();

    const alert = await page.find('json-viewer [role="alert"]');
    expect(alert).not.toBeNull();
  });

  it('has copy button', async () => {
    const page = await newE2EPage();
    await page.setContent(`<json-viewer data='${sampleJson}'></json-viewer>`);
    await page.waitForChanges();

    const copyButton = await page.find('json-viewer button[aria-label*="Copy JSON"]');
    expect(copyButton).not.toBeNull();
    expect(copyButton.getAttribute('type')).toBe('button');
  });

  it('shows property count', async () => {
    const page = await newE2EPage();
    await page.setContent(`<json-viewer data='${sampleJson}'></json-viewer>`);
    await page.waitForChanges();

    // Should show "3 properties" for the sample JSON
    const propertiesLabel = await page.find('json-viewer [aria-live="polite"]');
    if (propertiesLabel) {
      const text = propertiesLabel.textContent;
      expect(text).toContain('3');
      expect(text).toContain('properties');
    }
  });

  it('max-height prop is applied', async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<json-viewer data='${sampleJson}' max-height="200"></json-viewer>`,
    );
    await page.waitForChanges();

    const element = await page.find('json-viewer');
    expect(await element.getProperty('maxHeight')).toBe(200);
  });
});
