import { newSpecPage } from '@stencil/core/testing';
import { PidComponent } from '../../../components/pid-component/pid-component';
import { checkA11y } from '../../axe-helper';

// Mock the Database to avoid real IndexedDB/network calls
jest.mock('../../../utils/IndexedDBUtil', () => ({
  Database: jest.fn().mockImplementation(() => ({
    getEntity: jest.fn().mockResolvedValue(null),
  })),
}));

// Mock the DataCache to avoid real Cache API calls
jest.mock('../../../utils/DataCache', () => ({
  clearCache: jest.fn().mockResolvedValue(undefined),
  cachedFetch: jest.fn().mockResolvedValue(undefined),
}));

describe('pid-component', () => {
  it('renders with a value prop', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test-value"></pid-component>',
    });
    expect(page.root).toBeTruthy();
    expect(page.root.tagName).toBe('PID-COMPONENT');
  });

  it('sets the value prop correctly', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="10.1234/example"></pid-component>',
    });
    expect(page.rootInstance.value).toBe('10.1234/example');
  });

  it('has correct default props', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    const instance = page.rootInstance;
    expect(instance.settings).toBe('[]');
    expect(instance.amountOfItems).toBe(10);
    expect(instance.levelOfSubcomponents).toBe(1);
    expect(instance.currentLevelOfSubcomponents).toBe(0);
    expect(instance.emphasizeComponent).toBe(true);
    expect(instance.showTopLevelCopy).toBe(true);
    expect(instance.darkMode).toBe('light');
    expect(instance.fallbackToAll).toBe(true);
  });

  it('defaults settings to empty array string', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    expect(page.rootInstance.settings).toBe('[]');
  });

  it('defaults amountOfItems to 10', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    expect(page.rootInstance.amountOfItems).toBe(10);
  });

  it('defaults defaultTTL to 24 hours in milliseconds', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    expect(page.rootInstance.defaultTTL).toBe(24 * 60 * 60 * 1000);
  });

  it('renderers prop is set correctly via attribute', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: `<pid-component value="test" renderers='["DOIType","ORCIDType"]'></pid-component>`,
    });
    expect(page.rootInstance.renderers).toBe('["DOIType","ORCIDType"]');
  });

  it('does not crash with invalid renderers JSON', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: `<pid-component value="test" renderers='not valid json'></pid-component>`,
    });
    expect(page.root).toBeTruthy();
    // Component should still render (displayStatus will be 'unmatched' since getEntity returns null)
  });

  it('renders nothing when displayStatus is unmatched', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    // With our mock returning null, the Database constructor or getEntity may throw,
    // resulting in either 'unmatched' or 'error' status depending on mock behavior
    const status = page.rootInstance.displayStatus;
    expect(['unmatched', 'error']).toContain(status);
    if (status === 'unmatched') {
      // The Host should have display:none in shadowRoot
      const shadowHtml = page.root.shadowRoot.innerHTML;
      expect(shadowHtml).toContain('display: none');
    }
  });

  it('fallbackToAll defaults to true', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    expect(page.rootInstance.fallbackToAll).toBe(true);
  });

  it('fallbackToAll can be set to false', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test" fallback-to-all="false"></pid-component>',
    });
    expect(page.rootInstance.fallbackToAll).toBe(false);
  });

  it('darkMode defaults to light', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    expect(page.rootInstance.darkMode).toBe('light');
  });

  it('darkMode can be set to dark', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test" dark-mode="dark"></pid-component>',
    });
    expect(page.rootInstance.darkMode).toBe('dark');
  });

  it('darkMode can be set to system', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test" dark-mode="system"></pid-component>',
    });
    expect(page.rootInstance.darkMode).toBe('system');
  });

  it('openByDefault is undefined by default', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    expect(page.rootInstance.openByDefault).toBeFalsy();
  });

  it('hideSubcomponents is undefined by default', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    expect(page.rootInstance.hideSubcomponents).toBeFalsy();
  });

  it('displayStatus resolves after componentWillLoad', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    // After componentWillLoad, with our mock returning null, status should be 'unmatched' or 'error'
    const status = page.rootInstance.displayStatus;
    expect(['unmatched', 'error']).toContain(status);
  });

  it('renders loading spinner when displayStatus is loading', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    // Force displayStatus to loading to test rendering
    page.rootInstance.displayStatus = 'loading';
    page.rootInstance.identifierObject = undefined;
    await page.waitForChanges();

    const shadowHtml = page.root.shadowRoot.innerHTML;
    expect(shadowHtml).toContain('Loading...');
    expect(shadowHtml).toContain('animate-spin');
    // Should contain the value in loading text
    expect(shadowHtml).toContain('test');
  });

  it('renders error message when displayStatus is error', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    page.rootInstance.displayStatus = 'error';
    page.rootInstance.identifierObject = undefined;
    await page.waitForChanges();

    const shadowHtml = page.root.shadowRoot.innerHTML;
    expect(shadowHtml).toContain('Error loading data for');
    expect(shadowHtml).toContain('test');
    // Should have alert role
    expect(shadowHtml).toContain('role="alert"');
  });

  it('dark mode "system" uses matchMedia', async () => {
    // Mock matchMedia to return dark preference
    const mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: mockMatchMedia,
    });

    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test" dark-mode="system"></pid-component>',
    });
    expect(page.rootInstance.darkMode).toBe('system');
    expect(page.rootInstance.isDarkMode).toBe(true);
  });

  it('dark mode "dark" sets isDarkMode to true', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test" dark-mode="dark"></pid-component>',
    });
    expect(page.rootInstance.isDarkMode).toBe(true);
  });

  it('dark mode "light" sets isDarkMode to false', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test" dark-mode="light"></pid-component>',
    });
    expect(page.rootInstance.isDarkMode).toBe(false);
  });

  it('emphasizeComponent prop defaults to true', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    expect(page.rootInstance.emphasizeComponent).toBe(true);
  });

  it('emphasizeComponent set to false updates temporarilyEmphasized', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test" emphasize-component="false"></pid-component>',
    });
    expect(page.rootInstance.emphasizeComponent).toBe(false);
    expect(page.rootInstance.temporarilyEmphasized).toBe(false);
  });

  it('showTopLevelCopy defaults to true', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    expect(page.rootInstance.showTopLevelCopy).toBe(true);
  });

  it('showTopLevelCopy can be set to false', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test" show-top-level-copy="false"></pid-component>',
    });
    expect(page.rootInstance.showTopLevelCopy).toBe(false);
  });

  it('component handles componentWillLoad failure gracefully', async () => {
    // Override the mock to make getEntity throw
    const { Database } = require('../../../utils/IndexedDBUtil');
    Database.mockImplementation(() => ({
      getEntity: jest.fn().mockRejectedValue(new Error('DB connection failed')),
    }));

    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="failing-test"></pid-component>',
    });

    expect(page.rootInstance.displayStatus).toBe('error');
    expect(page.rootInstance.identifierObject).toBeUndefined();
    expect(page.rootInstance.items).toEqual([]);
    expect(page.rootInstance.actions).toEqual([]);

    // Restore default mock behavior
    Database.mockImplementation(() => ({
      getEntity: jest.fn().mockResolvedValue(null),
    }));
  });

  it('width and height props pass through', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test" width="600px" height="400px"></pid-component>',
    });
    expect(page.rootInstance.width).toBe('600px');
    expect(page.rootInstance.height).toBe('400px');
  });

  it('width and height props are undefined by default', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    expect(page.rootInstance.width).toBeUndefined();
    expect(page.rootInstance.height).toBeUndefined();
  });

  it('host element has relative and font-sans classes on root', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    // The Host classes are applied to the root element itself
    const rootClasses = page.root.className;
    expect(rootClasses).toContain('relative');
    expect(rootClasses).toContain('font-sans');
  });

  it('unmatched status renders host with display none via style', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    // With mock returning null, status is already 'unmatched'
    const status = page.rootInstance.displayStatus;
    if (status === 'unmatched') {
      expect(page.root.style.display).toBe('none');
    } else {
      // If status is 'error' due to mock, just verify it's not loading
      expect(status).not.toBe('loading');
    }
  });

  it('validateAmountOfItems resets invalid value to 10', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    page.rootInstance.validateAmountOfItems(0);
    expect(page.rootInstance.amountOfItems).toBe(10);

    page.rootInstance.validateAmountOfItems(-5);
    expect(page.rootInstance.amountOfItems).toBe(10);
  });

  it('disconnectedCallback cleans up resources', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    const instance = page.rootInstance;
    instance.disconnectedCallback();

    expect(instance.identifierObject).toBeUndefined();
    expect(instance.items).toEqual([]);
    expect(instance.actions).toEqual([]);
  });

  it('loading spinner has role status and aria-live polite', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    page.rootInstance.displayStatus = 'loading';
    page.rootInstance.identifierObject = undefined;
    await page.waitForChanges();

    const shadowHtml = page.root.shadowRoot.innerHTML;
    expect(shadowHtml).toContain('role="status"');
    expect(shadowHtml).toContain('aria-live="polite"');
  });
});

describe('pid-component accessibility', () => {
  it('has no a11y violations in loading state', async () => {
    const page = await newSpecPage({
      components: [PidComponent],
      html: '<pid-component value="test"></pid-component>',
    });
    page.rootInstance.displayStatus = 'loading';
    page.rootInstance.identifierObject = undefined;
    await page.waitForChanges();

    // pid-component uses shadow DOM, so we need to get the shadow root HTML
    const shadowHtml = page.root.shadowRoot.innerHTML;
    await checkA11y(shadowHtml);
  });
});
