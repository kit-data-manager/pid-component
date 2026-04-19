import { render, h } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';
// h is the JSX factory required at runtime by TSX – do not remove
void h;

/**
 * NOTE: pid-component uses shadow: true, so shadowRoot.innerHTML IS available.
 * However, @State properties (isDarkMode, displayStatus, identifierObject,
 * items, actions, loadSubcomponents, temporarilyEmphasized, isExpanded, tablePage)
 * are NOT accessible from outside the element.
 *
 * The vi.mock for Database/DataCache does NOT work in this environment because
 * the component loads from the pre-built Stencil dist, not from source.
 * The actual component will hit the real Database constructor (which throws
 * "indexedDB is not defined" in mock-doc) and end up in 'error' displayStatus.
 */

describe('pid-component', () => {
  it('renders with a value prop', async () => {
    const { root } = await render(<pid-component value="test-value"></pid-component>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-COMPONENT');
  });

  it('sets the value prop correctly', async () => {
    const { root } = await render(<pid-component value="10.1234/example"></pid-component>);
    expect(root.value).toBe('10.1234/example');
  });

  it('has correct default props', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.settings).toBe('[]');
    expect(root.amountOfItems).toBe(10);
    expect(root.levelOfSubcomponents).toBe(1);
    expect(root.currentLevelOfSubcomponents).toBe(0);
    expect(root.emphasizeComponent).toBe(true);
    expect(root.showTopLevelCopy).toBe(true);
    expect(root.darkMode).toBe('light');
    expect(root.fallbackToAll).toBe(true);
  });

  it('defaults settings to empty array string', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.settings).toBe('[]');
  });

  it('defaults amountOfItems to 10', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.amountOfItems).toBe(10);
  });

  it('defaults defaultTTL to 24 hours in milliseconds', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.defaultTTL).toBe(24 * 60 * 60 * 1000);
  });

  it('renderers prop is set correctly via attribute', async () => {
    const { root } = await render(
      <pid-component value="test" renderers='["DOIType","ORCIDType"]'></pid-component>
    );
    expect(root.renderers).toBe('["DOIType","ORCIDType"]');
  });

  it('does not crash with invalid renderers JSON', async () => {
    const { root } = await render(
      <pid-component value="test" renderers='not valid json'></pid-component>
    );
    expect(root).toBeTruthy();
    // Component should still render (will end up in 'error' status due to indexedDB not available)
  });

  it('renders error state since indexedDB is not available in mock-doc', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    // With no indexedDB in mock-doc, the Database constructor throws,
    // resulting in 'error' displayStatus.
    // displayStatus is @State so we can't access it directly.
    // Instead, check the shadow DOM for the error message.
    const shadowHtml = root.shadowRoot.innerHTML;
    expect(shadowHtml).toContain('Error loading data for');
    expect(shadowHtml).toContain('test');
  });

  it('fallbackToAll defaults to true', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.fallbackToAll).toBe(true);
  });

  it('fallbackToAll can be set to false programmatically', async () => {
    const { root, waitForChanges } = await render(
      <pid-component value="test"></pid-component>,
    );
    // In Stencil mock-doc, boolean false props passed via JSX attribute are not applied.
    // Set programmatically instead.
    root.fallbackToAll = false;
    await waitForChanges();
    expect(root.fallbackToAll).toBe(false);
  });

  it('darkMode defaults to light', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.darkMode).toBe('light');
  });

  it('darkMode can be set to dark', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="dark"></pid-component>);
    expect(root.darkMode).toBe('dark');
  });

  it('darkMode can be set to system', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="system"></pid-component>);
    expect(root.darkMode).toBe('system');
  });

  it('openByDefault is undefined by default', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.openByDefault).toBeFalsy();
  });

  it('hideSubcomponents is undefined by default', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.hideSubcomponents).toBeFalsy();
  });

  it('error state is rendered in shadow DOM when indexedDB unavailable', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    // displayStatus is @State (not accessible externally).
    // Check the shadow DOM for error content.
    const shadowHtml = root.shadowRoot.innerHTML;
    expect(shadowHtml).toContain('Error loading data for');
  });

  it('renders error message in shadow DOM', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    const shadowHtml = root.shadowRoot.innerHTML;
    expect(shadowHtml).toContain('Error loading data for');
    expect(shadowHtml).toContain('test');
    // Should have alert role
    expect(shadowHtml).toContain('role="alert"');
  });

  it('dark mode "system" sets darkMode prop', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="system"></pid-component>);
    expect(root.darkMode).toBe('system');
    // isDarkMode is @State (not accessible from outside)
  });

  it('dark mode "dark" sets darkMode prop', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="dark"></pid-component>);
    expect(root.darkMode).toBe('dark');
    // isDarkMode is @State (not accessible from outside)
  });

  it('dark mode "light" sets darkMode prop', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="light"></pid-component>);
    expect(root.darkMode).toBe('light');
    // isDarkMode is @State (not accessible from outside)
  });

  it('emphasizeComponent prop defaults to true', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.emphasizeComponent).toBe(true);
  });

  it('emphasizeComponent can be set to false programmatically', async () => {
    const { root, waitForChanges } = await render(
      <pid-component value="test"></pid-component>,
    );
    // In Stencil mock-doc, boolean false props passed via JSX attribute are not applied.
    // Set programmatically instead.
    root.emphasizeComponent = false;
    await waitForChanges();
    expect(root.emphasizeComponent).toBe(false);
    // temporarilyEmphasized is @State (not accessible from outside)
  });

  it('showTopLevelCopy defaults to true', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.showTopLevelCopy).toBe(true);
  });

  it('showTopLevelCopy can be set to false programmatically', async () => {
    const { root, waitForChanges } = await render(
      <pid-component value="test"></pid-component>,
    );
    // In Stencil mock-doc, boolean false props passed via JSX attribute are not applied.
    root.showTopLevelCopy = false;
    await waitForChanges();
    expect(root.showTopLevelCopy).toBe(false);
  });

  it('component handles indexedDB unavailability gracefully', async () => {
    // In mock-doc, indexedDB is not defined, so Database constructor throws.
    // The component catches the error and sets displayStatus to 'error'.
    const { root } = await render(<pid-component value="failing-test"></pid-component>);

    // displayStatus, identifierObject, items, actions are all @State (not accessible).
    // Verify via shadow DOM that the error message is rendered.
    const shadowHtml = root.shadowRoot.innerHTML;
    expect(shadowHtml).toContain('Error loading data for');
    expect(shadowHtml).toContain('failing-test');
  });

  it('width and height props pass through', async () => {
    const { root } = await render(
      <pid-component value="test" width="600px" height="400px"></pid-component>
    );
    expect(root.width).toBe('600px');
    expect(root.height).toBe('400px');
  });

  it('width and height props are undefined by default', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.width).toBeUndefined();
    expect(root.height).toBeUndefined();
  });

  it('host element has relative and font-sans classes on root', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    // The Host classes are applied to the root element itself
    const rootClasses = root.className;
    expect(rootClasses).toContain('relative');
    expect(rootClasses).toContain('font-sans');
  });

  it('amountOfItems prop can be set', async () => {
    const { root } = await render(<pid-component value="test" amount-of-items={20}></pid-component>);
    expect(root.amountOfItems).toBe(20);
  });

  it('levelOfSubcomponents prop defaults to 1', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.levelOfSubcomponents).toBe(1);
  });

  it('error state renders with alert role in shadow DOM', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    const shadowHtml = root.shadowRoot.innerHTML;
    // Since indexedDB is not available, component is in error state
    expect(shadowHtml).toContain('role="alert"');
    expect(shadowHtml).toContain('aria-live="assertive"');
  });
});

describe('pid-component accessibility', () => {
  it('has no a11y violations in error state', async () => {
    const { checkA11y } = await import('../../axe-helper');
    const { root } = await render(<pid-component value="test"></pid-component>);
    // pid-component uses shadow DOM, test via shadowRoot
    await checkA11y(root.shadowRoot.innerHTML);
  });
});
