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

});
