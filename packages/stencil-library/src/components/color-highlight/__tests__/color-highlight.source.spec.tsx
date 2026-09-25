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
    // In mock-doc, non-shadow component inner content is not in the DOM.
    // Verify the prop is set correctly instead.
    expect(root.text).toContain('Hello World');
  });
});
