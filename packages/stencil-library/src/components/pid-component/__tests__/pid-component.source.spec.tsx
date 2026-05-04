import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@stencil/vitest';
import '../pid-component';

vi.mock('../../utils/IndexedDBUtil', () => ({
  Database: vi.fn(),
}));

vi.mock('../../utils/DataCache', () => ({
  DataCache: vi.fn(),
}));

vi.mock('../../utils/GenericIdentifierType', () => ({
  GenericIdentifierType: vi.fn(),
}));

beforeEach(() => {
  Element.prototype.attachShadow = vi.fn().mockReturnValue({
    appendChild: vi.fn(),
    innerHTML: '',
    querySelector: vi.fn().mockReturnValue(null),
    querySelectorAll: vi.fn().mockReturnValue([]),
  });
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('pid-component source', () => {
  it('renders with value prop', async () => {
    const { root } = await render(<pid-component value="test-value"></pid-component>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-COMPONENT');
  });

  it('renders with empty value', async () => {
    const { root } = await render(<pid-component value=""></pid-component>);
    expect(root).toBeTruthy();
  });

  it('renders with custom itemsPerPage', async () => {
    const { root } = await render(<pid-component value="test" items-per-page={20}></pid-component>);
    expect(root.itemsPerPage).toBe(20);
  });

  it('renders with custom itemsPerPage 50', async () => {
    const { root } = await render(<pid-component value="test" items-per-page={50}></pid-component>);
    expect(root.itemsPerPage).toBe(50);
  });

  it('renders with levelOfSubcomponents', async () => {
    const { root } = await render(<pid-component value="test" level-of-subcomponents={3}></pid-component>);
    expect(root.levelOfSubcomponents).toBe(3);
  });

  it('renders with levelOfSubcomponents 0', async () => {
    const { root } = await render(<pid-component value="test" level-of-subcomponents={0}></pid-component>);
    expect(root.levelOfSubcomponents).toBe(0);
  });

  it('renders with levelOfSubcomponents 5', async () => {
    const { root } = await render(<pid-component value="test" level-of-subcomponents={5}></pid-component>);
    expect(root.levelOfSubcomponents).toBe(5);
  });

  it('renders with currentLevelOfSubcomponents', async () => {
    const { root } = await render(<pid-component value="test" current-level-of-subcomponents={2}></pid-component>);
    expect(root.currentLevelOfSubcomponents).toBe(2);
  });

  it('renders with hideSubcomponents true', async () => {
    const { root } = await render(<pid-component value="test" hide-subcomponents></pid-component>);
    expect(root.hideSubcomponents).toBe(true);
  });

  it('renders with emphasizeComponent true', async () => {
    const { root } = await render(<pid-component value="test" emphasize-component></pid-component>);
    expect(root.emphasizeComponent).toBe(true);
  });

  it('renders with showTopLevelCopy true', async () => {
    const { root } = await render(<pid-component value="test" show-top-level-copy></pid-component>);
    expect(root.showTopLevelCopy).toBe(true);
  });


  it('renders with custom width', async () => {
    const { root } = await render(<pid-component value="test" width="600px"></pid-component>);
    expect(root.width).toBe('600px');
  });

  it('renders with custom width 50%', async () => {
    const { root } = await render(<pid-component value="test" width="50%"></pid-component>);
    expect(root.width).toBe('50%');
  });

  it('renders with custom width 800px', async () => {
    const { root } = await render(<pid-component value="test" width="800px"></pid-component>);
    expect(root.width).toBe('800px');
  });

  it('renders with custom height', async () => {
    const { root } = await render(<pid-component value="test" height="400px"></pid-component>);
    expect(root.height).toBe('400px');
  });

  it('renders with custom height 50vh', async () => {
    const { root } = await render(<pid-component value="test" height="50vh"></pid-component>);
    expect(root.height).toBe('50vh');
  });

  it('renders with custom height 600px', async () => {
    const { root } = await render(<pid-component value="test" height="600px"></pid-component>);
    expect(root.height).toBe('600px');
  });

  it('renders with darkMode dark', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="dark"></pid-component>);
    expect(root.darkMode).toBe('dark');
  });

  it('renders with darkMode light', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="light"></pid-component>);
    expect(root.darkMode).toBe('light');
  });

  it('renders with darkMode system', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="system"></pid-component>);
    expect(root.darkMode).toBe('system');
  });

  it('renders with settings prop', async () => {
    const settings = JSON.stringify([{ type: 'test', values: [] }]);
    const { root } = await render(<pid-component value="test" settings={settings}></pid-component>);
    expect(root.settings).toBe(settings);
  });

  it('renders with empty settings', async () => {
    const { root } = await render(<pid-component value="test" settings="[]"></pid-component>);
    expect(root.settings).toBe('[]');
  });

  it('renders with renderers prop', async () => {
    const { root } = await render(<pid-component value="test" renderers='["DOIType"]'></pid-component>);
    expect(root.renderers).toBe('["DOIType"]');
  });

  it('renders with multiple renderers', async () => {
    const { root } = await render(<pid-component value="test" renderers='["DOIType","ORCIDType"]'></pid-component>);
    expect(root.renderers).toBe('["DOIType","ORCIDType"]');
  });

  it('renders with fallbackToAll true', async () => {
    const { root } = await render(<pid-component value="test" fallback-to-all></pid-component>);
    expect(root.fallbackToAll).toBe(true);
  });

  it('renders with openByDefault true', async () => {
    const { root } = await render(<pid-component value="test" open-by-default></pid-component>);
    expect(root.openByDefault).toBe(true);
  });

  it('renders with host element with classes', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.className).toBeTruthy();
  });


  it('renders with multiple props combined', async () => {
    const { root } = await render(
      <pid-component
        value="10.1234/test"
        dark-mode="dark"
        width="800px"
        height="600px"
        items-per-page={25}
        level-of-subcomponents={2}
      ></pid-component>,
    );
    expect(root.darkMode).toBe('dark');
    expect(root.width).toBe('800px');
    expect(root.height).toBe('600px');
    expect(root.itemsPerPage).toBe(25);
    expect(root.levelOfSubcomponents).toBe(2);
  });

  it('renders with all boolean props true', async () => {
    const { root } = await render(
      <pid-component
        value="test"
        open-by-default
        hide-subcomponents
        emphasize-component
        show-top-level-copy
        fallback-to-all
      ></pid-component>,
    );
    expect(root.openByDefault).toBe(true);
    expect(root.hideSubcomponents).toBe(true);
    expect(root.emphasizeComponent).toBe(true);
    expect(root.showTopLevelCopy).toBe(true);
    expect(root.fallbackToAll).toBe(true);
  });

  it('renders with large levelOfSubcomponents', async () => {
    const { root } = await render(<pid-component value="test" level-of-subcomponents={100}></pid-component>);
    expect(root.levelOfSubcomponents).toBe(100);
  });

  it('renders with URL value', async () => {
    const { root } = await render(<pid-component value="https://example.com/10.1234/test"></pid-component>);
    expect(root.value).toBe('https://example.com/10.1234/test');
  });

  it('renders with DOI value', async () => {
    const { root } = await render(<pid-component value="10.1234/Example.DOI.1234"></pid-component>);
    expect(root.value).toBe('10.1234/Example.DOI.1234');
  });

  it('renders with ORCID value', async () => {
    const { root } = await render(<pid-component value="https://orcid.org/0000-0002-1234-5678"></pid-component>);
    expect(root.value).toBe('https://orcid.org/0000-0002-1234-5678');
  });

  it('renders with ROR ID value', async () => {
    const { root } = await render(<pid-component value="https://ror.org/02mhbdp94"></pid-component>);
    expect(root.value).toBe('https://ror.org/02mhbdp94');
  });

  it('renders with various itemsPerPage values', async () => {
    const values = [5, 10, 15, 20, 25, 50, 100];
    for (const val of values) {
      const { root } = await render(<pid-component value="test" items-per-page={val}></pid-component>);
      expect(root.itemsPerPage).toBe(val);
    }
  });

  it('renders with various levelOfSubcomponents values', async () => {
    const values = [0, 1, 2, 3, 5, 10];
    for (const val of values) {
      const { root } = await render(<pid-component value="test" level-of-subcomponents={val}></pid-component>);
      expect(root.levelOfSubcomponents).toBe(val);
    }
  });

  it('renders with different darkMode values', async () => {
    for (const mode of ['light', 'dark', 'system']) {
      const { root } = await render(<pid-component value="test" dark-mode={mode}></pid-component>);
      expect(root.darkMode).toBe(mode);
    }
  });
});
