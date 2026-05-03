import { render, h } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';
// h is the JSX factory required at runtime by TSX – do not remove
void h;

/**
 * NOTE: In Stencil's mock-doc lazy-loaded environment, non-shadow components
 * (json-viewer uses shadow: false, scoped: true) do NOT render their template
 * children into the DOM. This means root.querySelector() for internal elements
 * returns null.
 *
 * @State properties (currentViewMode, expandedNodes, parsedData, error, copied, isDarkMode)
 * are NOT accessible from outside the element.
 *
 * @Watch methods (handleDataChange, handleExpandAllChange, etc.) are NOT callable externally.
 *
 * Private methods (toggleView, copyToClipboard) are NOT callable externally.
 * @Method() decorated methods (expandAllNodes, collapseAllNodes) ARE callable.
 *
 * Tests verify:
 * 1. @Prop values are accessible on the element
 * 2. @Method() calls work
 * 3. Component renders without errors
 */

describe('json-viewer', () => {
  it('renders with data prop as JSON string', async () => {
    const { root } = await render(<json-viewer data='{"key":"value"}'></json-viewer>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('JSON-VIEWER');
  });

  it('renders with data prop as JSON object set programmatically', async () => {
    const { root, waitForChanges } = await render(<json-viewer></json-viewer>);
    root.data = { name: 'test', count: 42 };
    // handleDataChange is a @Watch handler (not callable externally).
    // Setting the data prop should trigger the watcher automatically.
    await waitForChanges();
    expect(root).toBeTruthy();
    expect(root.data).toEqual({ name: 'test', count: 42 });
  });

  it('handles invalid JSON string gracefully', async () => {
    const { root } = await render(<json-viewer data="not valid json"></json-viewer>);
    expect(root).toBeTruthy();
    // error is @State (not accessible from outside).
    // parsedData is @State (not accessible from outside).
    // The component should render without crashing.
    expect(root.data).toBe('not valid json');
  });

  it('renders without crashing for broken JSON', async () => {
    const { root } = await render(<json-viewer data="{{broken}"></json-viewer>);
    // In mock-doc, internal content (error div) is not in the DOM.
    // Verify the component rendered without throwing.
    expect(root).toBeTruthy();
  });

  it('has correct default viewMode prop', async () => {
    const { root } = await render(<json-viewer data='{"a":1}'></json-viewer>);
    expect(root.viewMode).toBe('tree');
    // currentViewMode is @State (not accessible from outside)
  });

  it('defaults maxHeight to 500', async () => {
    const { root } = await render(<json-viewer data='{"a":1}'></json-viewer>);
    expect(root.maxHeight).toBe(500);
  });

  it('defaults showLineNumbers to true', async () => {
    const { root } = await render(<json-viewer data='{"a":1}'></json-viewer>);
    expect(root.showLineNumbers).toBe(true);
  });

  it('defaults theme to system', async () => {
    const { root } = await render(<json-viewer data='{"a":1}'></json-viewer>);
    expect(root.theme).toBe('system');
  });

  it('viewMode prop can be set to code', async () => {
    const { root } = await render(<json-viewer data='{"name":"test","count":42}' view-mode="code"></json-viewer>);
    expect(root.viewMode).toBe('code');
    // currentViewMode is @State (not accessible from outside).
    // Internal content (pre element) is not in the DOM in mock-doc.
  });

  it('showLineNumbers prop can be set to false programmatically', async () => {
    const { root, waitForChanges } = await render(
      <json-viewer data='{"a":1}' view-mode="code"></json-viewer>,
    );
    // In Stencil mock-doc, boolean false props passed via JSX attribute are not applied.
    // Set programmatically instead.
    root.showLineNumbers = false;
    await waitForChanges();
    expect(root.showLineNumbers).toBe(false);
  });

  it('viewMode tree is the default', async () => {
    const { root } = await render(
      <json-viewer data='{"nested":{"inner":"value"}}' view-mode="tree"></json-viewer>,
    );
    expect(root.viewMode).toBe('tree');
  });

  it('expandAll prop can be set', async () => {
    const { root } = await render(
      <json-viewer data='{"a":{"b":{"c":1}}}' view-mode="tree" expand-all={true}></json-viewer>,
    );
    expect(root.expandAll).toBe(true);
    // expandedNodes is @State (not accessible from outside)
  });

  it('theme prop can be set to dark', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' theme="dark"></json-viewer>);
    expect(root.theme).toBe('dark');
    // isDarkMode is @State (not accessible from outside)
  });

  it('theme prop can be set to light', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' theme="light"></json-viewer>);
    expect(root.theme).toBe('light');
    // isDarkMode is @State (not accessible from outside)
  });

  it('expandAllNodes @Method does not throw', async () => {
    const { root } = await render(
      <json-viewer data='{"key":"value"}' view-mode="tree"></json-viewer>,
    );
    // expandAllNodes is a @Method() - should be callable
    await expect(root.expandAllNodes()).resolves.not.toThrow();
  });

  it('collapseAllNodes @Method does not throw', async () => {
    const { root } = await render(
      <json-viewer data='{"key":"value"}' view-mode="tree"></json-viewer>,
    );
    // collapseAllNodes is a @Method() - should be callable
    await expect(root.collapseAllNodes()).resolves.not.toThrow();
  });

  it('data prop is accessible after render', async () => {
    const { root } = await render(<json-viewer data='{"a":1}'></json-viewer>);
    expect(root.data).toBe('{"a":1}');
  });

  it('renders without errors when no data is provided', async () => {
    const { root } = await render(<json-viewer></json-viewer>);
    // parsedData is @State (not accessible from outside).
    // The component should render a "No data provided" fallback internally.
    expect(root).toBeTruthy();
  });

  it('data prop can be updated programmatically', async () => {
    const { root, waitForChanges } = await render(<json-viewer></json-viewer>);
    root.data = { name: 'test', $elm$: 'internal', $cmp$: {} };
    await waitForChanges();
    // parsedData is @State (not accessible from outside).
    // The component internally strips $ prefixed keys via sanitizeData.
    expect(root.data).toEqual({ name: 'test', $elm$: 'internal', $cmp$: {} });
  });

  it('data prop with multiple properties', async () => {
    const { root } = await render(<json-viewer data='{"a":1,"b":2,"c":3}'></json-viewer>);
    // Internal header text is not accessible in mock-doc.
    expect(root.data).toBe('{"a":1,"b":2,"c":3}');
  });

  it('data prop with single property', async () => {
    const { root } = await render(<json-viewer data='{"single":1}'></json-viewer>);
    expect(root.data).toBe('{"single":1}');
  });

  it('maxHeight prop can be set', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' max-height={300}></json-viewer>);
    expect(root.maxHeight).toBe(300);
    // Internal content styles are not accessible in mock-doc.
  });

  it('maxHeight 0 is accepted', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' max-height={0}></json-viewer>);
    expect(root.maxHeight).toBe(0);
  });

  it('expandAll can be toggled', async () => {
    const { root, waitForChanges } = await render(
      <json-viewer data='{"a":{"b":1}}' view-mode="tree" expand-all={true}></json-viewer>,
    );
    expect(root.expandAll).toBe(true);

    // Now set expandAll to false
    root.expandAll = false;
    await waitForChanges();
    expect(root.expandAll).toBe(false);
    // expandedNodes is @State (not accessible from outside)
  });

  it('handles null data gracefully', async () => {
    const { root } = await render(<json-viewer data={null}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles number data', async () => {
    const { root } = await render(<json-viewer data={42}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles boolean data', async () => {
    const { root } = await render(<json-viewer data={true}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles array data', async () => {
    const { root } = await render(<json-viewer data={[1, 2, 3]}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles nested objects with special keys', async () => {
    const { root } = await render(
      <json-viewer data='{"$schema":"test","data":{"$elm":{"value":1}}}'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('handles empty object', async () => {
    const { root } = await render(<json-viewer data="{}"></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles empty array', async () => {
    const { root } = await render(<json-viewer data="[]"></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles deep nesting', async () => {
    const { root } = await render(
      <json-viewer data='{"a":{"b":{"c":{"d":{"e":1}}}}}'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('handles special JSON characters in strings', async () => {
    const { root } = await render(<json-viewer data='{"text":"Hello\\nWorld"}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles unicode characters', async () => {
    const { root } = await render(<json-viewer data='{"emoji":"😀"}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles large numbers', async () => {
    const { root } = await render(<json-viewer data='{"big":1e20}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles decimal numbers', async () => {
    const { root } = await render(<json-viewer data='{"decimal":3.14159}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles negative numbers', async () => {
    const { root } = await render(<json-viewer data='{"negative":-42}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles zero', async () => {
    const { root } = await render(<json-viewer data='{"zero":0}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles whitespace in JSON', async () => {
    const { root } = await render(<json-viewer data='{ "key" : "value" }'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('theme prop reflects correctly', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' theme="light"></json-viewer>);
    expect(root.theme).toBe('light');
  });

  it('system theme uses default', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' theme="system"></json-viewer>);
    expect(root.theme).toBe('system');
  });

  it('viewMode prop reflects correctly for tree', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' view-mode="tree"></json-viewer>);
    expect(root.viewMode).toBe('tree');
  });

  it('maxHeight prop reflects correctly', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' max-height={100}></json-viewer>);
    expect(root.maxHeight).toBe(100);
  });

  it('expandAll prop reflects correctly when true', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' expand-all={true}></json-viewer>);
    expect(root.expandAll).toBe(true);
  });
});

describe('json-viewer accessibility', () => {
  it('has no a11y violations', async () => {
    const { checkA11y } = await import('../../../utils/__tests__/axe-helper');
    const { root } = await render(<json-viewer data='{"key":"value"}'></json-viewer>);
    await checkA11y(root.outerHTML);
  });
});
