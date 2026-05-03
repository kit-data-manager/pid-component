import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, h } from '@stencil/vitest';

Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  writable: true,
});

import '../locale-visualization';

describe('locale-visualization source', () => {
  it('renders with locale prop', async () => {
    const { root } = await render(<locale-visualization locale="en-US"></locale-visualization>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('LOCALE-VISUALIZATION');
  });

  it('displays locale text', async () => {
    const { root } = await render(<locale-visualization locale="en-US"></locale-visualization>);
    expect(root.textContent).toBeTruthy();
  });

  it('renders with showFlag true', async () => {
    const { root } = await render(<locale-visualization locale="en-US" showFlag={true}></locale-visualization>);
    expect(root).toBeTruthy();
  });

  it('renders with showFlag false', async () => {
    const { root } = await render(<locale-visualization locale="en-US" showFlag={false}></locale-visualization>);
    expect(root).toBeTruthy();
  });

  it('handles region locale format', async () => {
    const { root } = await render(<locale-visualization locale="US"></locale-visualization>);
    expect(root).toBeTruthy();
  });

  it('handles language locale format', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    expect(root).toBeTruthy();
  });

  it('renders span element', async () => {
    const { root } = await render(<locale-visualization locale="de-DE"></locale-visualization>);
    const span = root.querySelector('span');
    expect(span).toBeTruthy();
  });
});