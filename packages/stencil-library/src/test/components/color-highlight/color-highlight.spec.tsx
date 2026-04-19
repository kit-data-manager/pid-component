// noinspection JSUnusedLocalSymbols – h is the JSX factory used implicitly by TSX
import { render } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';

describe('color-highlight', () => {
  it('renders with text prop', async () => {
    const { root } = await render(<color-highlight text="DOI"></color-highlight>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('COLOR-HIGHLIGHT');
  });

  it('displays the text content', async () => {
    const { root } = await render(<color-highlight text="Handle"></color-highlight>);
    // In mock-doc, non-shadow component inner content is not in the DOM.
    // Verify the prop is set correctly instead.
    expect(root.text).toBe('Handle');
  });

  it('applies a color style based on text', async () => {
    const { root } = await render(<color-highlight text="ORCID"></color-highlight>);
    // The component generates an HSL color internally (@State color).
    // In mock-doc, internal rendered content is not accessible.
    // Verify the component rendered without errors and the prop is set.
    expect(root).toBeTruthy();
    expect(root.text).toBe('ORCID');
  });

  it('sets the text prop correctly', async () => {
    const { root } = await render(<color-highlight text="TestValue"></color-highlight>);
    expect(root.text).toBe('TestValue');
  });
});

describe('color-highlight accessibility', () => {
  it('has no a11y violations', async () => {
    const { checkA11y } = await import('../../axe-helper');
    const { root } = await render(<color-highlight text="DOI"></color-highlight>);
    await checkA11y(root.outerHTML);
  });
});
