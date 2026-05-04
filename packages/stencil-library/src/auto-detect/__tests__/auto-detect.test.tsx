import { describe, expect, it, vi } from 'vitest';
import { h, render } from '@stencil/vitest';
import { initPidDetection } from '../initPidDetection';
// h is the JSX factory required at runtime by TSX – do not remove
void h;

const DOI_examples = {
  VALID_BARE: '10.52825/ocp.v5i.1411',
  DATACITE_JOURNAL_PAPER: '10.5445/IR/1000188026',
};

vi.mock('../../components/json-viewer/json-viewer', () => ({}));

describe('auto-detect e2e', () => {
  it('creates pid-components for detected PIDs in text', async () => {
    const { root } = await render(
      <div id="content">
        <p>See {DOI_examples.DATACITE_JOURNAL_PAPER} for details</p>
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
    const doiValue = DOI_examples.VALID_BARE;

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
        <p class="no-detect">{DOI_examples.VALID_BARE}</p>
        <p class="detect-me">{DOI_examples.VALID_BARE}</p>
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
    expect(excludedEl?.textContent).toContain(DOI_examples.VALID_BARE);
  });

  it('destroy() restores original text', async () => {
    const { root, waitForChanges } = await render(
      <div id="content">
        <p id="test-paragraph">Check {DOI_examples.VALID_BARE} here</p>
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
    expect(restoredText).toContain(DOI_examples.VALID_BARE);
  });

  it('detection controller has stop, rescan, and destroy methods', async () => {
    const { root } = await render(
      <div id="content">
        <p>Some text with {DOI_examples.VALID_BARE}</p>
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
