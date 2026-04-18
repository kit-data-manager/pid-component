import { render, h } from '@stencil/vitest';
import { describe, it, expect } from 'vitest';
import { checkA11y } from '../../axe-helper';

describe('locale-visualization', () => {
  it('renders with locale prop', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('LOCALE-VISUALIZATION');
  });

  it('sets the locale prop correctly', async () => {
    const { root } = await render(<locale-visualization locale="de"></locale-visualization>);
    expect(root.locale).toBe('de');
  });

  it('displays locale information in a span', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    const span = root.querySelector('span');
    expect(span).toBeTruthy();
    expect(span.textContent.length).toBeGreaterThan(0);
  });

  it('showFlag defaults to true', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    expect(root.showFlag).toBe(true);
  });
});

describe('locale-visualization accessibility', () => {
  it('has no a11y violations', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    await checkA11y(root.outerHTML);
  });
});
