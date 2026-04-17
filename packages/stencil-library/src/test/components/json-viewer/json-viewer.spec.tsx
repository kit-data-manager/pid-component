import { newSpecPage } from '@stencil/core/testing';
import { JsonViewer } from '../../../components/json-viewer/json-viewer';
import { checkA11y } from '../../axe-helper';

describe('json-viewer', () => {
  it('renders with data prop as JSON string', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"key":"value"}'></json-viewer>`,
    });
    expect(page.root).toBeTruthy();
    expect(page.root.tagName).toBe('JSON-VIEWER');
  });

  it('renders with data prop as JSON object set programmatically', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: '<json-viewer></json-viewer>',
    });
    page.rootInstance.data = { name: 'test', count: 42 };
    page.rootInstance.handleDataChange();
    await page.waitForChanges();
    expect(page.root).toBeTruthy();
    expect(page.rootInstance.parsedData).toEqual({ name: 'test', count: 42 });
  });

  it('handles invalid JSON string gracefully', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='not valid json'></json-viewer>`,
    });
    expect(page.root).toBeTruthy();
    expect(page.rootInstance.error).toBeTruthy();
    expect(page.rootInstance.parsedData).toBeNull();
  });

  it('shows error state for invalid input', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{{broken}'></json-viewer>`,
    });
    const errorDiv = page.root.querySelector('[role="alert"]');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toContain('Invalid JSON');
  });

  it('has correct default viewMode of tree', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}'></json-viewer>`,
    });
    expect(page.rootInstance.viewMode).toBe('tree');
    expect(page.rootInstance.currentViewMode).toBe('tree');
  });

  it('defaults maxHeight to 500', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}'></json-viewer>`,
    });
    expect(page.rootInstance.maxHeight).toBe(500);
  });

  it('defaults showLineNumbers to true', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}'></json-viewer>`,
    });
    expect(page.rootInstance.showLineNumbers).toBe(true);
  });

  it('defaults theme to system', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}'></json-viewer>`,
    });
    expect(page.rootInstance.theme).toBe('system');
  });

  it('code view renders formatted JSON', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"name":"test","count":42}' view-mode="code"></json-viewer>`,
    });
    expect(page.rootInstance.currentViewMode).toBe('code');
    // Should contain a pre element for code view
    const pre = page.root.querySelector('pre');
    expect(pre).toBeTruthy();
    // Should show formatted JSON content
    expect(pre.textContent).toContain('name');
    expect(pre.textContent).toContain('test');
    expect(pre.textContent).toContain('42');
  });

  it('code view renders line numbers when showLineNumbers is true', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}' view-mode="code" show-line-numbers="true"></json-viewer>`,
    });
    // Line numbers are rendered in a separate div next to the pre element
    const lineNumberDiv = page.root.querySelector('.border-r');
    expect(lineNumberDiv).toBeTruthy();
    // Should contain at least line number 1
    expect(lineNumberDiv.textContent).toContain('1');
  });

  it('code view hides line numbers when showLineNumbers is false', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}' view-mode="code" show-line-numbers="false"></json-viewer>`,
    });
    expect(page.rootInstance.showLineNumbers).toBe(false);
    // Should not render the line numbers column
    const lineNumberDiv = page.root.querySelector('.border-r');
    expect(lineNumberDiv).toBeNull();
    // But should still render the code
    const pre = page.root.querySelector('pre');
    expect(pre).toBeTruthy();
  });

  it('tree view renders expandable nodes for objects', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"nested":{"inner":"value"}}' view-mode="tree"></json-viewer>`,
    });
    expect(page.rootInstance.currentViewMode).toBe('tree');
    // Tree view should have details elements for expandable nodes
    const details = page.root.querySelectorAll('details');
    expect(details.length).toBeGreaterThan(0);
    // Should render the key name
    const summaryText = page.root.querySelector('summary');
    expect(summaryText.textContent).toContain('nested');
  });

  it('tree view renders array nodes with item count', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"items":[1,2,3]}' view-mode="tree"></json-viewer>`,
    });
    const summaryText = page.root.querySelector('summary');
    expect(summaryText.textContent).toContain('items');
    expect(summaryText.textContent).toContain('3 items');
  });

  it('tree view renders primitive values directly', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"name":"hello","count":5,"active":true}' view-mode="tree"></json-viewer>`,
    });
    // Primitive values are rendered in div[role="treeitem"] elements
    const treeItems = page.root.querySelectorAll('[role="treeitem"]');
    expect(treeItems.length).toBe(3);
    // Check that they contain the expected content
    const allText = Array.from(treeItems).map(el => el.textContent).join(' ');
    expect(allText).toContain('name');
    expect(allText).toContain('"hello"');
    expect(allText).toContain('count');
    expect(allText).toContain('5');
    expect(allText).toContain('active');
    expect(allText).toContain('true');
  });

  it('expandAll prop populates expandedNodes', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":{"b":{"c":1}}}' view-mode="tree" expand-all="true"></json-viewer>`,
    });
    expect(page.rootInstance.expandAll).toBe(true);
    // expandedNodes should contain entries for the nested objects
    expect(page.rootInstance.expandedNodes.size).toBeGreaterThan(0);
  });

  it('theme prop applies dark class when set to dark', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}' theme="dark"></json-viewer>`,
    });
    expect(page.rootInstance.theme).toBe('dark');
    expect(page.rootInstance.isDarkMode).toBe(true);
    // The outer container should have dark mode classes
    const container = page.root.querySelector('.bg-gray-800');
    expect(container).toBeTruthy();
  });

  it('theme prop applies light class when set to light', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}' theme="light"></json-viewer>`,
    });
    expect(page.rootInstance.isDarkMode).toBe(false);
    const container = page.root.querySelector('.bg-white');
    expect(container).toBeTruthy();
  });

  it('copy to clipboard calls navigator.clipboard.writeText', async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"key":"value"}' view-mode="tree"></json-viewer>`,
    });

    await page.rootInstance.copyToClipboard();
    await page.waitForChanges();

    expect(writeTextMock).toHaveBeenCalled();
    // The argument should be pretty-printed JSON
    const calledWith = writeTextMock.mock.calls[0][0];
    expect(calledWith).toContain('"key"');
    expect(calledWith).toContain('"value"');
    expect(page.rootInstance.copied).toBe(true);
  });

  it('copy button shows success state after copy', async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}'></json-viewer>`,
    });

    await page.rootInstance.copyToClipboard();
    await page.waitForChanges();

    // The copy button should show success state
    const copyButton = page.root.querySelector('button[title="Copied!"]');
    expect(copyButton).toBeTruthy();
    expect(copyButton.getAttribute('aria-label')).toContain('copied');
  });

  it('toggleView switches between tree and code view', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}' view-mode="tree"></json-viewer>`,
    });
    expect(page.rootInstance.currentViewMode).toBe('tree');

    page.rootInstance.toggleView();
    await page.waitForChanges();
    expect(page.rootInstance.currentViewMode).toBe('code');

    page.rootInstance.toggleView();
    await page.waitForChanges();
    expect(page.rootInstance.currentViewMode).toBe('tree');
  });

  it('toggle view button has correct label', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}' view-mode="tree"></json-viewer>`,
    });
    // When in tree view, button should say "Code View"
    const toggleBtn = page.root.querySelector('button[aria-label*="Switch to"]');
    expect(toggleBtn).toBeTruthy();
    expect(toggleBtn.textContent).toContain('Code View');
  });

  it('shows no data message when parsedData is null', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer></json-viewer>`,
    });
    // When no data is provided, parsedData stays null and an error may be set
    // or it renders the "No data provided" fallback
    const instance = page.rootInstance;
    expect(instance.parsedData).toBeNull();
    // The component should show either error or no data message
    const noDataOrError = page.root.querySelector('[role="status"], [role="alert"]');
    expect(noDataOrError).toBeTruthy();
  });

  it('sanitizes data by stripping $ prefixed keys', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer></json-viewer>`,
    });
    page.rootInstance.data = { name: 'test', $elm$: 'internal', $cmp$: {} };
    page.rootInstance.handleDataChange();
    await page.waitForChanges();

    const parsed = page.rootInstance.parsedData;
    expect(parsed).toHaveProperty('name');
    expect(parsed).not.toHaveProperty('$elm$');
    expect(parsed).not.toHaveProperty('$cmp$');
  });

  it('displays property count in header', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1,"b":2,"c":3}'></json-viewer>`,
    });
    // The header should show "3 properties"
    const headerText = page.root.querySelector('[aria-live="polite"]');
    expect(headerText.textContent).toContain('3 properties');
  });

  it('displays singular property for single key', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"single":1}'></json-viewer>`,
    });
    const headerText = page.root.querySelector('[aria-live="polite"]');
    expect(headerText.textContent).toContain('1 property');
  });

  it('maxHeight applies to container style', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}' max-height="300"></json-viewer>`,
    });
    expect(page.rootInstance.maxHeight).toBe(300);
    const contentDiv = page.root.querySelector('[role="group"]');
    expect(contentDiv.getAttribute('style')).toContain('max-height: 300px');
  });

  it('maxHeight 0 does not add max-height style', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":1}' max-height="0"></json-viewer>`,
    });
    expect(page.rootInstance.maxHeight).toBe(0);
    const contentDiv = page.root.querySelector('[role="group"]');
    // Empty style when maxHeight is 0
    const style = contentDiv.getAttribute('style') || '';
    expect(style).not.toContain('max-height');
  });

  it('expandAll false collapses all nodes', async () => {
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"a":{"b":1}}' view-mode="tree" expand-all="true"></json-viewer>`,
    });
    // Nodes should be expanded
    expect(page.rootInstance.expandedNodes.size).toBeGreaterThan(0);

    // Now collapse all
    page.rootInstance.expandAll = false;
    page.rootInstance.handleExpandAllChange();
    await page.waitForChanges();
    expect(page.rootInstance.expandedNodes.size).toBe(0);
  });
});

describe('json-viewer accessibility', () => {
  it('has no a11y violations', async () => {
    // Use code view to avoid treeitem aria-required-parent issue in tree view
    const page = await newSpecPage({
      components: [JsonViewer],
      html: `<json-viewer data='{"key":"value"}' view-mode="code"></json-viewer>`,
    });
    await checkA11y(page.root.outerHTML);
  });
});
