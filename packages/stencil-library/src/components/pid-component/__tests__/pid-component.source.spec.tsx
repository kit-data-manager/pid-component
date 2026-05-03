import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, h } from '@stencil/vitest';

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
});

afterEach(() => {
  vi.clearAllMocks();
});

import '../pid-component';

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
    expect(root).toBeTruthy();
  });

  it('renders with custom levelOfSubcomponents', async () => {
    const { root } = await render(<pid-component value="test" level-of-subcomponents={3}></pid-component>);
    expect(root).toBeTruthy();
  });

  it('renders with darkMode dark', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="dark"></pid-component>);
    expect(root).toBeTruthy();
  });

  it('renders with darkMode system', async () => {
    const { root } = await render(<pid-component value="test" dark-mode="system"></pid-component>);
    expect(root).toBeTruthy();
  });

  it('renders with custom width', async () => {
    const { root } = await render(<pid-component value="test" width="600px"></pid-component>);
    expect(root).toBeTruthy();
  });

  it('renders with custom height', async () => {
    const { root } = await render(<pid-component value="test" height="400px"></pid-component>);
    expect(root).toBeTruthy();
  });

  it('renders host element with classes', async () => {
    const { root } = await render(<pid-component value="test"></pid-component>);
    expect(root.className).toBeTruthy();
  });
});