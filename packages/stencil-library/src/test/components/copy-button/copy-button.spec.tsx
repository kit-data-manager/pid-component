// noinspection JSUnusedLocalSymbols – h is the JSX factory used implicitly by TSX
import { render } from '@stencil/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Helper: mock navigator.clipboard.writeText and return the mock function.
 */
function mockClipboard() {
  const writeTextMock = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    writable: true,
    configurable: true,
  });
  return writeTextMock;
}

/**
 * Helper: click the <button> inside the component and wait for re-render.
 */
async function clickCopyButton(root: HTMLElement, waitForChanges: () => Promise<void>) {
  const button = root.querySelector('button');
  const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
  button.dispatchEvent(clickEvent);
  // Give the async clipboard handler time to resolve
  await new Promise(r => setTimeout(r, 0));
  await waitForChanges();
}

describe('copy-button', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders with value prop', async () => {
    const { root } = await render(<copy-button value="test-value"></copy-button>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('COPY-BUTTON');
  });

  it('sets the value prop correctly', async () => {
    const { root } = await render(<copy-button value="my-value"></copy-button>);
    expect(root.value).toBe('my-value');
  });

  it('renders with optional label prop', async () => {
    const { root } = await render(<copy-button value="val" label="DOI"></copy-button>);
    expect(root.label).toBe('DOI');
  });

  it('has a button element', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.getAttribute('type')).toBe('button');
  });

  it('button has correct aria-label when no label prop is provided', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Copy content to clipboard');
  });

  it('button has correct aria-label when label prop is provided', async () => {
    const { root } = await render(<copy-button value="test" label="DOI"></copy-button>);
    const button = root.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Copy DOI to clipboard');
  });

  it('renders aria-label containing the value when label matches value', async () => {
    const { root } = await render(<copy-button value="10.1234/test" label="10.1234/test"></copy-button>);
    const button = root.querySelector('button');
    expect(button.getAttribute('aria-label')).toContain('10.1234/test');
  });

  it('renders "Copy" as default button text', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button.textContent).toBe('Copy');
  });

  it('shows success state after copyValue is called', async () => {
    const writeTextMock = mockClipboard();

    const { root, waitForChanges } = await render(<copy-button value="copy-me"></copy-button>);

    await clickCopyButton(root, waitForChanges);

    expect(writeTextMock).toHaveBeenCalledWith('copy-me');

    // Button text should change to success state
    const updatedButton = root.querySelector('button');
    expect(updatedButton.textContent).toContain('Copied!');
  });

  it('aria-label changes to copied state after successful copy', async () => {
    mockClipboard();

    const { root, waitForChanges } = await render(<copy-button value="test" label="DOI"></copy-button>);

    await clickCopyButton(root, waitForChanges);

    const button = root.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('DOI copied to clipboard');
  });

  it('renders sr-only live region when copied is true', async () => {
    mockClipboard();

    const { root, waitForChanges } = await render(<copy-button value="test"></copy-button>);

    // Before copy, no sr-only region
    let srOnly = root.querySelector('.sr-only');
    expect(srOnly).toBeNull();

    await clickCopyButton(root, waitForChanges);

    srOnly = root.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly.getAttribute('aria-live')).toBe('assertive');
    expect(srOnly.textContent).toContain('Content copied to clipboard');
  });

  it('button has correct CSS classes for default state', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button.className).toContain('rounded-md');
    expect(button.className).toContain('border');
    expect(button.className).toContain('font-mono');
    expect(button.className).toContain('font-medium');
    // Default (not copied, not dark mode) should include bg-white
    expect(button.className).toContain('bg-white');
  });

  it('button has green background CSS class after successful copy', async () => {
    mockClipboard();

    const { root, waitForChanges } = await render(<copy-button value="test"></copy-button>);

    await clickCopyButton(root, waitForChanges);

    const button = root.querySelector('button');
    expect(button.className).toContain('bg-green-200');
  });

  it('host has inline-block class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root.className).toContain('inline-block');
  });

  it('copyValue stops event propagation', async () => {
    mockClipboard();

    const { root, waitForChanges } = await render(<copy-button value="test"></copy-button>);

    // Attach a listener on the host to verify the click does NOT bubble up
    const parentClickSpy = vi.fn();
    root.addEventListener('click', parentClickSpy);

    await clickCopyButton(root, waitForChanges);

    // The component calls stopPropagation, so the click should not reach the host
    expect(parentClickSpy).not.toHaveBeenCalled();
  });

  it('showSuccess sets copied to true then resets', async () => {
    mockClipboard();

    // Render BEFORE enabling fake timers (render uses real async internally)
    const { root, waitForChanges } = await render(<copy-button value="test"></copy-button>);

    // Click to trigger copy, wait for the async clipboard handler
    await clickCopyButton(root, waitForChanges);

    // After clicking, copied state should be true
    expect(root.querySelector('button').textContent).toContain('Copied!');

    // Wait for the 1.5s reset timeout (real timer in the component)
    await new Promise(r => setTimeout(r, 1600));
    await waitForChanges();

    expect(root.querySelector('button').textContent).toBe('Copy');
  }, 10000);
});

describe('copy-button accessibility', () => {
  it('has no a11y violations', async () => {
    const { checkA11y } = await import('../../axe-helper');
    const { root } = await render(<copy-button value="test-value"></copy-button>);
    await checkA11y(root.outerHTML);
  });
});

describe('copy-button additional coverage', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('success state shows check icon after copy', async () => {
    mockClipboard();

    const { root, waitForChanges } = await render(<copy-button value="test"></copy-button>);

    await clickCopyButton(root, waitForChanges);

    const button = root.querySelector('button');
    // The check mark is included in the button text "✓ Copied!"
    expect(button.textContent).toContain('✓');
    expect(button.textContent).toContain('Copied!');
  });

  it('component has sr-only label for screen readers after copy', async () => {
    mockClipboard();

    const { root, waitForChanges } = await render(<copy-button value="test"></copy-button>);

    await clickCopyButton(root, waitForChanges);

    const srOnly = root.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly.getAttribute('aria-live')).toBe('assertive');
    expect(srOnly.textContent).toContain('Content copied to clipboard');
  });

  it('copyValue uses execCommand fallback when clipboard API is unavailable', async () => {
    // Remove clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    // Stub textarea methods that mock-doc does not implement
    const origCreateElement = document.createElement.bind(document);
    document.createElement = ((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === 'textarea') {
        el.select = vi.fn();
        el.setSelectionRange = vi.fn();
        el.focus = el.focus || vi.fn();
      }
      return el;
    }) as typeof document.createElement;

    // Render BEFORE enabling fake timers
    const { root, waitForChanges } = await render(<copy-button value="fallback-value"></copy-button>);

    vi.useFakeTimers();

    const button = root.querySelector('button');
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    button.dispatchEvent(clickEvent);

    // The fallback uses setTimeout(200ms) before calling execCommand
    vi.advanceTimersByTime(200);

    vi.useRealTimers();
    await waitForChanges();

    expect(execCommandMock).toHaveBeenCalledWith('copy');

    // Restore original createElement
    document.createElement = origCreateElement;
  });
});
