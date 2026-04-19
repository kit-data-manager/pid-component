// noinspection JSUnusedLocalSymbols – h is the JSX factory used implicitly by TSX
import { render } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';

describe('copy-button e2e', () => {
  it('renders and gets hydrated class', async () => {
    const { root } = await render(<copy-button value="test-value" />);
    expect(root).toHaveClass('hydrated');
  });

  it('renders a button element', async () => {
    const { root, waitForChanges } = await render(<copy-button value="hello" />);
    await waitForChanges();

    const button = root.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.tagName).toBe('BUTTON');
  });

  it('button has correct aria-label', async () => {
    const { root, waitForChanges } = await render(<copy-button value="test" label="DOI" />);
    await waitForChanges();

    const button = root.querySelector('button');
    const ariaLabel = button?.getAttribute('aria-label');
    expect(ariaLabel).toBe('Copy DOI to clipboard');
  });

  it('button has default aria-label when no label prop', async () => {
    const { root, waitForChanges } = await render(<copy-button value="test" />);
    await waitForChanges();

    const button = root.querySelector('button');
    const ariaLabel = button?.getAttribute('aria-label');
    expect(ariaLabel).toBe('Copy content to clipboard');
  });

  it('shows "Copy" label text by default', async () => {
    const { root, waitForChanges } = await render(<copy-button value="test" />);
    await waitForChanges();

    const button = root.querySelector('button');
    const text = button?.textContent;
    expect(text).toContain('Copy');
  });

  it('value attribute is set correctly', async () => {
    const { root } = await render(<copy-button value="10.1234/test-doi" />);
    expect(root.value).toBe('10.1234/test-doi');
  });

  it('button has type="button" attribute', async () => {
    const { root, waitForChanges } = await render(<copy-button value="test" />);
    await waitForChanges();

    const button = root.querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('button has title attribute matching aria-label', async () => {
    const { root, waitForChanges } = await render(<copy-button value="test" label="identifier" />);
    await waitForChanges();

    const button = root.querySelector('button');
    const ariaLabel = button?.getAttribute('aria-label');
    const title = button?.getAttribute('title');
    expect(title).toBe(ariaLabel);
  });
});
