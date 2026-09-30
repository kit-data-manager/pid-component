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

  it('renders start and end datetime inputs plus two stacked arrow buttons', async () => {
    const { root } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    const inputs = shadowRoot.querySelectorAll('input[type="datetime-local"]');
    const buttons = shadowRoot.querySelectorAll('button');
    expect(inputs.length).toBe(2);
    expect(buttons.length).toBe(2);
    expect((buttons[0] as HTMLButtonElement).textContent?.trim()).toBe('→');
    expect((buttons[1] as HTMLButtonElement).textContent?.trim()).toBe('←');
  });

  it('computes the end datetime from the start and marks the end input green', async () => {
    const { root, waitForChanges } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    const inputs = shadowRoot.querySelectorAll('input[type="datetime-local"]');
    const [startInput, endInput] = inputs as unknown as HTMLInputElement[];

    startInput.value = '2024-01-01T00:00';
    startInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await waitForChanges();

    // Top arrow → computes end from start.
    (shadowRoot.querySelectorAll('button')[0] as HTMLButtonElement).click();
    await waitForChanges();

    // P7DT2H from 2024-01-01T00:00 -> 2024-01-08T02:00.
    expect(endInput.value).toBe('2024-01-08T02:00');
    // The computed result gets a green border (box-shadow ring). The browser
    // normalizes the shadow to "0 0 0 2px #16a34a".
    expect(endInput.style.boxShadow).toContain('2px #16a34a');
    expect(startInput.style.boxShadow).toBe('');
  });

  it('computes the start datetime from the end and marks the start input green', async () => {
    const { root, waitForChanges } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    const inputs = shadowRoot.querySelectorAll('input[type="datetime-local"]');
    const [startInput, endInput] = inputs as unknown as HTMLInputElement[];

    endInput.value = '2024-01-08T02:00';
    endInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await waitForChanges();

    // Bottom arrow ← computes start from end.
    (shadowRoot.querySelectorAll('button')[1] as HTMLButtonElement).click();
    await waitForChanges();

    // P7DT2H subtracted from 2024-01-08T02:00 -> 2024-01-01T00:00.
    expect(startInput.value).toBe('2024-01-01T00:00');
    expect(startInput.style.boxShadow).toContain('2px #16a34a');
    expect(endInput.style.boxShadow).toBe('');
  });

  it('shows an error when computing end without a start', async () => {
    const { root, waitForChanges } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    (shadowRoot.querySelectorAll('button')[0] as HTMLButtonElement).click();
    await waitForChanges();
    expect(shadowRoot.textContent).toContain('Please enter a start datetime.');
  });

  it('shows an error when computing start without an end', async () => {
    const { root, waitForChanges } = await render(<duration-calculator iso-duration="P7DT2H"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    (shadowRoot.querySelectorAll('button')[1] as HTMLButtonElement).click();
    await waitForChanges();
    expect(shadowRoot.textContent).toContain('Please enter an end datetime.');
  });

  it('reports an invalid duration gracefully', async () => {
    const { root } = await render(<duration-calculator iso-duration="not-a-duration"></duration-calculator>);
    const shadowRoot = root.shadowRoot as ShadowRoot;
    expect(shadowRoot.textContent).toContain('Invalid duration');
  });
});
