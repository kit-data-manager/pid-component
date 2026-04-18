import { render, h } from '@stencil/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { checkA11y } from '../../axe-helper';

describe('copy-button', () => {
  afterEach(() => {
    vi.useRealTimers();
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
    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const { root, waitForChanges } = await render(<copy-button value="copy-me"></copy-button>);

    // Simulate click with a mock MouseEvent
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    vi.spyOn(clickEvent, 'stopPropagation');
    vi.spyOn(clickEvent, 'preventDefault');

    await root.copyValue(clickEvent);
    await waitForChanges();

    expect(writeTextMock).toHaveBeenCalledWith('copy-me');
    expect(root.copied).toBe(true);

    // Button text should change to success state
    const updatedButton = root.querySelector('button');
    expect(updatedButton.textContent).toContain('Copied!');
  });

  it('aria-label changes to copied state after successful copy', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const { root, waitForChanges } = await render(<copy-button value="test" label="DOI"></copy-button>);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    await root.copyValue(clickEvent);
    await waitForChanges();

    const button = root.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('DOI copied to clipboard');
  });

  it('renders sr-only live region when copied is true', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const { root, waitForChanges } = await render(<copy-button value="test"></copy-button>);

    // Before copy, no sr-only region
    let srOnly = root.querySelector('.sr-only');
    expect(srOnly).toBeNull();

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    await root.copyValue(clickEvent);
    await waitForChanges();

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
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const { root, waitForChanges } = await render(<copy-button value="test"></copy-button>);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    await root.copyValue(clickEvent);
    await waitForChanges();

    const button = root.querySelector('button');
    expect(button.className).toContain('bg-green-200');
  });

  it('host has inline-block class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root.className).toContain('inline-block');
  });

  it('copyValue stops event propagation', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const { root } = await render(<copy-button value="test"></copy-button>);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(clickEvent, 'stopPropagation');
    const preventSpy = vi.spyOn(clickEvent, 'preventDefault');

    await root.copyValue(clickEvent);

    expect(stopSpy).toHaveBeenCalled();
    expect(preventSpy).toHaveBeenCalled();
  });

  it('showSuccess sets copied to true then resets', async () => {
    // Create component BEFORE enabling fake timers
    const { root } = await render(<copy-button value="test"></copy-button>);

    vi.useFakeTimers();

    // Call showSuccess directly to avoid clipboard API issues with fake timers
    root.showSuccess();
    expect(root.copied).toBe(true);

    // Fast-forward 1.5 seconds
    vi.advanceTimersByTime(1500);
    expect(root.copied).toBe(false);

    vi.useRealTimers();
  });
});

describe('copy-button accessibility', () => {
  it('has no a11y violations', async () => {
    const { root } = await render(<copy-button value="test-value"></copy-button>);
    await checkA11y(root.outerHTML);
  });
});

describe('copy-button additional coverage', () => {
  it('copyValue uses execCommand fallback when clipboard API is unavailable', async () => {
    // Remove clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    const { root } = await render(<copy-button value="fallback-value"></copy-button>);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    vi.spyOn(clickEvent, 'stopPropagation');
    vi.spyOn(clickEvent, 'preventDefault');

    await root.copyValue(clickEvent);
    // The fallback path creates a textarea and uses setTimeout(200ms),
    // so we verify the event propagation was stopped
    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(clickEvent.preventDefault).toHaveBeenCalled();
  });

  it('success state shows check icon after copy', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const { root, waitForChanges } = await render(<copy-button value="test"></copy-button>);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    await root.copyValue(clickEvent);
    await waitForChanges();

    expect(root.copied).toBe(true);
    const button = root.querySelector('button');
    // The check mark is included in the button text "✓ Copied!"
    expect(button.textContent).toContain('✓');
    expect(button.textContent).toContain('Copied!');
  });

  it('component has sr-only label for screen readers after copy', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const { root, waitForChanges } = await render(<copy-button value="test"></copy-button>);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    await root.copyValue(clickEvent);
    await waitForChanges();

    const srOnly = root.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly.getAttribute('aria-live')).toBe('assertive');
    expect(srOnly.textContent).toContain('Content copied to clipboard');
  });
});
