import { describe, expect, it, vi } from 'vitest';
import { render } from '@stencil/vitest';
import '../color-highlight';

vi.mock('./HSLColor', () => ({
  HSLColor: {
    generateColor: vi.fn().mockResolvedValue({ hue: 120, sat: 50, lum: 50 }),
  },
}));

describe('color-highlight source', () => {
  it('renders with text prop', async () => {
    const { root } = await render(<color-highlight text="test"></color-highlight>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('COLOR-HIGHLIGHT');
  });

  it('displays the text content', async () => {
    const { root } = await render(<color-highlight text="Hello World"></color-highlight>);
    expect(root.textContent).toContain('Hello World');
  });

  it('renders span with correct classes', async () => {
    const { root } = await render(<color-highlight text="test"></color-highlight>);
    const span = root.querySelector('span');
    expect(span).toBeTruthy();
    expect(span?.className).toContain('font-mono');
    expect(span?.className).toContain('font-bold');
  });

  it('renders with hsl color from mock', async () => {
    const { root } = await render(<color-highlight text="colored"></color-highlight>);
    const span = root.querySelector('span');
    expect(span).toBeTruthy();
    // Check that color style is applied
    const style = span?.getAttribute('style');
    expect(style).toContain('color');
  });

  it('applies inline color style', async () => {
    const { root } = await render(<color-highlight text="test"></color-highlight>);
    const span = root.querySelector('span');
    expect(span?.style.color).toBeTruthy();
  });
});
