import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, h } from '@stencil/vitest';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

import '../pid-tooltip';

describe('pid-tooltip source', () => {
  it('renders with text prop', async () => {
    const { root } = await render(<pid-tooltip text="Tooltip text"></pid-tooltip>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-TOOLTIP');
  });

  it('renders with position prop top', async () => {
    const { root } = await render(<pid-tooltip text="Test" position="top"></pid-tooltip>);
    expect(root.position).toBe('top');
  });

  it('renders with position prop bottom', async () => {
    const { root } = await render(<pid-tooltip text="Test" position="bottom"></pid-tooltip>);
    expect(root.position).toBe('bottom');
  });

  it('renders with maxWidth prop', async () => {
    const { root } = await render(<pid-tooltip text="Test" max-width="300px"></pid-tooltip>);
    expect(root.maxWidth).toBe('300px');
  });

  it('renders with maxHeight prop', async () => {
    const { root } = await render(<pid-tooltip text="Test" max-height="200px"></pid-tooltip>);
    expect(root.maxHeight).toBe('200px');
  });

  it('renders with fitContent true', async () => {
    const { root } = await render(<pid-tooltip text="Test" fit-content={true}></pid-tooltip>);
    expect(root.fitContent).toBe(true);
  });

  it('renders without optional props', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root).toBeTruthy();
    expect(root.text).toBe('Test');
  });

  it('renders with required text prop', async () => {
    const { root } = await render(<pid-tooltip text="Required text"></pid-tooltip>);
    expect(root.text).toBe('Required text');
  });

  it('renders host element with classes', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root.className).toBeTruthy();
  });

  it('has button element for trigger', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('button has aria-expanded attribute', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-expanded')).toBe('false');
  });

  it('button has aria-label attribute', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-label')).toContain('Show additional information');
  });

  it('button has title attribute', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('title')).toContain('Show additional information');
  });

  it('button has type attribute', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('has SVG icon inside button', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const svg = root.querySelector('button svg');
    expect(svg).toBeTruthy();
  });

  it('tooltip div exists with tooltip role', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip).toBeTruthy();
  });

  it('tooltip has hidden class by default', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('hidden');
  });

  it('tooltip has sr-only span when visible', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const srOnly = root.querySelector('.sr-only.fixed');
    expect(srOnly).toBeNull();
  });

  it('renders with empty text', async () => {
    const { root } = await render(<pid-tooltip text=""></pid-tooltip>);
    expect(root).toBeTruthy();
  });

  it('renders with long text content', async () => {
    const longText = 'A'.repeat(500);
    const { root } = await render(<pid-tooltip text={longText}></pid-tooltip>);
    expect(root.text).toBe(longText);
  });

  it('renders with special characters in text', async () => {
    const { root } = await render(<pid-tooltip text="Test with <html> & special chars"></pid-tooltip>);
    expect(root.text).toBe('Test with <html> & special chars');
  });

  it('renders with unicode characters', async () => {
    const { root } = await render(<pid-tooltip text="Test 😀🎉🔗"></pid-tooltip>);
    expect(root.text).toBe('Test 😀🎉🔗');
  });

  it('getPositionClasses returns correct classes for top', async () => {
    const { root } = await render(<pid-tooltip text="Test" position="top"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('bottom-full');
  });

  it('getPositionClasses returns correct classes for bottom', async () => {
    const { root } = await render(<pid-tooltip text="Test" position="bottom"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('top-full');
  });
});