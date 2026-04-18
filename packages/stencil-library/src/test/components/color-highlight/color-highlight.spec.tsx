import { render, h } from '@stencil/vitest';
import { describe, it, expect } from 'vitest';
import { checkA11y } from '../../axe-helper';

describe('color-highlight', () => {
  it('renders with text prop', async () => {
    const { root } = await render(<color-highlight text="DOI"></color-highlight>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('COLOR-HIGHLIGHT');
  });

  it('displays the text content', async () => {
    const { root } = await render(<color-highlight text="Handle"></color-highlight>);
    const span = root.querySelector('span');
    expect(span).toBeTruthy();
    expect(span.textContent).toBe('Handle');
  });

  it('applies a color style to the span', async () => {
    const { root } = await render(<color-highlight text="ORCID"></color-highlight>);
    const span = root.querySelector('span');
    expect(span).toBeTruthy();
    const style = span.getAttribute('style');
    expect(style).toContain('color:');
    expect(style).toContain('hsl(');
  });

  it('sets the text prop correctly', async () => {
    const { root } = await render(<color-highlight text="TestValue"></color-highlight>);
    expect(root.text).toBe('TestValue');
  });
});

describe('color-highlight accessibility', () => {
  it('has no a11y violations', async () => {
    const { root } = await render(<color-highlight text="DOI"></color-highlight>);
    await checkA11y(root.outerHTML);
  });
});
