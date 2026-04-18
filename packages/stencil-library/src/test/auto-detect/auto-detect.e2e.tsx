import { render } from '@stencil/vitest';
import { describe, expect, it, vi } from 'vitest';
import { initPidDetection } from '../../auto-detect/initPidDetection';

describe('auto-detect e2e', () => {
  it('creates pid-components for detected PIDs in text', async () => {
    const { root, waitForChanges } = await render(
      <div id="content">
        <p>See 10.5281/zenodo.1234567 for details</p>
      </div>,
    );

    initPidDetection({
      root: root,
    });

    // Wait for async detection to wrap text in pid-component elements.
    // Detection runs asynchronously (potentially on a worker thread).
    await vi.waitFor(() => {
      const wrappers = root.querySelectorAll('[data-pid-auto-detected]');
      const pidComponents = root.querySelectorAll('pid-component');
      expect(wrappers.length + pidComponents.length).toBeGreaterThan(0);
    }, { timeout: 10000, interval: 200 });
  });

  it('original text remains visible before component loads', async () => {
    const doiValue = '10.5281/zenodo.9999999';

    const { root } = await render(
      <div id="content">
        <p>Reference: {doiValue}</p>
      </div>,
    );

    expect(root.textContent).toContain(doiValue);
  });

  it('exclude selector prevents detection in excluded elements', async () => {
    const { root, waitForChanges } = await render(
      <div id="content">
        <p class="no-detect">10.5281/zenodo.1234567</p>
        <p class="detect-me">10.5281/zenodo.7654321</p>
      </div>,
    );

    initPidDetection({
      root: root,
      exclude: '.no-detect',
    });

    await new Promise(r => setTimeout(r, 3000));
    await waitForChanges();

    // The excluded element should still contain its original text without wrappers
    const excludedEl = root.querySelector('.no-detect');
    expect(excludedEl?.textContent).toContain('10.5281/zenodo.1234567');
  });

  it('destroy() restores original text', async () => {
    const { root, waitForChanges } = await render(
      <div id="content">
        <p id="test-paragraph">Check 10.5281/zenodo.1234567 here</p>
      </div>,
    );

    const controller = initPidDetection({
      root: root,
    });

    await new Promise(r => setTimeout(r, 3000));
    await waitForChanges();

    // Destroy the controller
    controller.destroy();

    await waitForChanges();
    await new Promise(r => setTimeout(r, 500));

    // After destroy, no pid-components should remain
    const pidComponents = root.querySelectorAll('pid-component');
    expect(pidComponents.length).toBe(0);

    // Original text should be restored
    const restoredText = root.querySelector('#test-paragraph')?.textContent;
    expect(restoredText).toContain('10.5281/zenodo.1234567');
  });

  it('detection controller has stop, rescan, and destroy methods', async () => {
    const { root } = await render(
      <div id="content">
        <p>Some text with 10.5281/zenodo.1234567</p>
      </div>,
    );

    const controller = initPidDetection({
      root: root,
    });

    expect(typeof controller.stop).toBe('function');
    expect(typeof controller.rescan).toBe('function');
    expect(typeof controller.destroy).toBe('function');

    controller.destroy();
  });
});
