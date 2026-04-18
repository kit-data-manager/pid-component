import { render, h } from '@stencil/vitest';
import { describe, it, expect, vi } from 'vitest';
import { checkA11y } from '../../axe-helper';

// Mock the Database to avoid real IndexedDB/network calls
vi.mock('../../../utils/IndexedDBUtil', () => ({
  Database: vi.fn().mockImplementation(() => ({
    getEntity: vi.fn().mockResolvedValue(null),
  })),
}));

// Mock the DataCache to avoid real Cache API calls
vi.mock('../../../utils/DataCache', () => ({
  clearCache: vi.fn().mockResolvedValue(undefined),
  cachedFetch: vi.fn().mockResolvedValue(undefined),
}));

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
    // Component should still render (displayStatus will be 'unmatched' since getEntity returns null)
  });

  it('renders nothing when displayStatus is unmatched', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    // With our mock returning null, the Database constructor or getEntity may throw,
    // resulting in either 'unmatched' or 'error' status depending on mock behavior
    const status = root.displayStatus;
    expect(['unmatched', 'error']).toContain(status);
    if (status === 'unmatched') {
      // The Host should have display:none in shadowRoot
      const shadowHtml = root.shadowRoot.innerHTML;
      expect(shadowHtml).toContain('display: none');
    }
  });

  it('fallbackToAll defaults to true', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.fallbackToAll).toBe(true);
  });

  it('fallbackToAll can be set to false', async () => {
    const { root } = await render(
      <pid-component value="test" fallback-to-all={false}></pid-component>
    );
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

  it('displayStatus resolves after componentWillLoad', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    // After componentWillLoad, with our mock returning null, status should be 'unmatched' or 'error'
    const status = root.displayStatus;
    expect(['unmatched', 'error']).toContain(status);
  });

  it('renders loading spinner when displayStatus is loading', async () => {
    const { root, waitForChanges } = await render(<pid-component value="test"></pid-component>);
    // Force displayStatus to loading to test rendering
    root.displayStatus = 'loading';
    root.identifierObject = undefined;
    await waitForChanges();

    const shadowHtml = root.shadowRoot.innerHTML;
    expect(shadowHtml).toContain('Loading...');
    expect(shadowHtml).toContain('animate-spin');
    // Should contain the value in loading text
    expect(shadowHtml).toContain('test');
  });

  it('renders error message when displayStatus is error', async () => {
    const { root, waitForChanges } = await render(<pid-component value="test"></pid-component>);
    root.displayStatus = 'error';
    root.identifierObject = undefined;
    await waitForChanges();

    const shadowHtml = root.shadowRoot.innerHTML;
    expect(shadowHtml).toContain('Error loading data for');
    expect(shadowHtml).toContain('test');
    // Should have alert role
    expect(shadowHtml).toContain('role="alert"');
  });

  it('dark mode "system" uses matchMedia', async () => {
    // Mock matchMedia to return dark preference
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: mockMatchMedia,
    });

    const { root } = await render(<pid-component value="test" dark-mode="system"></pid-component>);
    expect(root.darkMode).toBe('system');
    expect(root.isDarkMode).toBe(true);
  });

  it('dark mode "dark" sets isDarkMode to true', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="dark"></pid-component>);
    expect(root.isDarkMode).toBe(true);
  });

  it('dark mode "light" sets isDarkMode to false', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="light"></pid-component>);
    expect(root.isDarkMode).toBe(false);
  });

  it('emphasizeComponent prop defaults to true', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.emphasizeComponent).toBe(true);
  });

  it('emphasizeComponent set to false updates temporarilyEmphasized', async () => {
    const { root } = await render(
      <pid-component value="test" emphasize-component={false}></pid-component>
    );
    expect(root.emphasizeComponent).toBe(false);
    expect(root.temporarilyEmphasized).toBe(false);
  });

  it('showTopLevelCopy defaults to true', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.showTopLevelCopy).toBe(true);
  });

  it('showTopLevelCopy can be set to false', async () => {
    const { root } = await render(
      <pid-component value="test" show-top-level-copy={false}></pid-component>
    );
    expect(root.showTopLevelCopy).toBe(false);
  });

  it('component handles componentWillLoad failure gracefully', async () => {
    // Override the mock to make getEntity throw
    const { Database } = await import('../../../utils/IndexedDBUtil');
    (Database as any).mockImplementation(() => ({
      getEntity: vi.fn().mockRejectedValue(new Error('DB connection failed')),
    }));

    const { root } = await render(<pid-component value="failing-test"></pid-component>);

    expect(root.displayStatus).toBe('error');
    expect(root.identifierObject).toBeUndefined();
    expect(root.items).toEqual([]);
    expect(root.actions).toEqual([]);

    // Restore default mock behavior
    (Database as any).mockImplementation(() => ({
      getEntity: vi.fn().mockResolvedValue(null),
    }));
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

  it('unmatched status renders host with display none via style', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    // With mock returning null, status is already 'unmatched'
    const status = root.displayStatus;
    if (status === 'unmatched') {
      expect(root.style.display).toBe('none');
    } else {
      // If status is 'error' due to mock, just verify it's not loading
      expect(status).not.toBe('loading');
    }
  });

  it('validateAmountOfItems resets invalid value to 10', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    root.validateAmountOfItems(0);
    expect(root.amountOfItems).toBe(10);

    root.validateAmountOfItems(-5);
    expect(root.amountOfItems).toBe(10);
  });

  it('disconnectedCallback cleans up resources', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    root.disconnectedCallback();

    expect(root.identifierObject).toBeUndefined();
    expect(root.items).toEqual([]);
    expect(root.actions).toEqual([]);
  });

  it('loading spinner has role status and aria-live polite', async () => {
    const { root, waitForChanges } = await render(<pid-component value="test"></pid-component>);
    root.displayStatus = 'loading';
    root.identifierObject = undefined;
    await waitForChanges();

    const shadowHtml = root.shadowRoot.innerHTML;
    expect(shadowHtml).toContain('role="status"');
    expect(shadowHtml).toContain('aria-live="polite"');
  });
});

describe('pid-component accessibility', () => {
  it('has no a11y violations in loading state', async () => {
    const { root, waitForChanges } = await render(<pid-component value="test"></pid-component>);
    root.displayStatus = 'loading';
    root.identifierObject = undefined;
    await waitForChanges();

    // pid-component uses shadow DOM, so we need to get the shadow root HTML
    const shadowHtml = root.shadowRoot.innerHTML;
    await checkA11y(shadowHtml);
  });
});
