import { h, render } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';
// h is the JSX factory required at runtime by TSX – do not remove
void h;

describe('duration-calculator', () => {
  it('renders with an iso-duration prop', async () => {
    const { root } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('DURATION-CALCULATOR');
  });

  it('exposes the isoDuration prop', async () => {
    const { root } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    expect(root.isoDuration).toBe('P7DT2H');
  });

  it('renders a start datetime input and calculate button in its shadow root', async () => {
    const { root } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    expect(shadowRoot).toBeTruthy();
    const input = shadowRoot.querySelector('input[type="datetime-local"]');
    const button = shadowRoot.querySelector('button');
    expect(input).toBeTruthy();
    expect(button).toBeTruthy();
    expect((button as HTMLButtonElement).textContent).toContain('Calculate end datetime');
  });

  it('shows the humanized duration', async () => {
    const { root } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    expect(shadowRoot.textContent).toContain('7 days, 2 hours');
  });

  it('computes an end datetime when a start datetime is entered and calculated', async () => {
    const { root, waitForChanges } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    const input = shadowRoot.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    const button = shadowRoot.querySelector('button') as HTMLButtonElement;

    // Enter a start datetime and notify the on-input handler.
    input.value = '2024-01-01T00:00:00';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await waitForChanges();

    button.click();
    await waitForChanges();

    expect(shadowRoot.textContent).toContain('End datetime:');
    // The end datetime is displayed via toLocaleString(), which is locale-
    // dependent, so parse the rendered value and assert on the calendar date.
    // Calendar-accurate: 2024-01-01T00:00:00 + P7DT2H = 2024-01-08T02:00:00.
    const text = shadowRoot.textContent ?? '';
    const idx = text.indexOf('→');
    const renderedEnd = text.slice(idx + 1).trim();
    const end = new Date(renderedEnd);
    expect(end.getFullYear()).toBe(2024);
    expect(end.getMonth()).toBe(0); // January
    expect(end.getDate()).toBe(8);
  });

  it('shows an error when calculating without a start datetime', async () => {
    const { root, waitForChanges } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    const button = shadowRoot.querySelector('button') as HTMLButtonElement;

    button.click();
    await waitForChanges();

    expect(shadowRoot.textContent).toContain('Please enter a start datetime.');
  });

  it('reports an invalid duration gracefully', async () => {
    const { root } = await render(<duration-calculator iso-duration="not-a-duration"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    expect(shadowRoot.textContent).toContain('Invalid duration');
  });

  it('renders the humanized duration for a compound duration', async () => {
    const { root } = await render(<duration-calculator iso-duration="P1Y2M3DT4H5M6S"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    expect(shadowRoot.textContent).toContain('1 year, 2 months, 3 days, 4 hours, 5 minutes, 6 seconds');
  });

});
