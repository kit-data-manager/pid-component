import { newSpecPage } from '@stencil/core/testing';
import { CopyButton } from '../../../components/copy-button/copy-button';

describe('copy-button', () => {
  it('renders with value prop', async () => {
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test-value"></copy-button>',
    });
    expect(page.root).toBeTruthy();
    expect(page.root.tagName).toBe('COPY-BUTTON');
  });

  it('sets the value prop correctly', async () => {
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="my-value"></copy-button>',
    });
    expect(page.rootInstance.value).toBe('my-value');
  });

  it('renders with optional label prop', async () => {
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="val" label="DOI"></copy-button>',
    });
    expect(page.rootInstance.label).toBe('DOI');
  });

  it('has a button element', async () => {
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test"></copy-button>',
    });
    const button = page.root.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.getAttribute('type')).toBe('button');
  });

  it('button has correct aria-label when no label prop is provided', async () => {
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test"></copy-button>',
    });
    const button = page.root.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Copy content to clipboard');
  });

  it('button has correct aria-label when label prop is provided', async () => {
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test" label="DOI"></copy-button>',
    });
    const button = page.root.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Copy DOI to clipboard');
  });

  it('renders aria-label containing the value when label matches value', async () => {
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="10.1234/test" label="10.1234/test"></copy-button>',
    });
    const button = page.root.querySelector('button');
    expect(button.getAttribute('aria-label')).toContain('10.1234/test');
  });

  it('renders "Copy" as default button text', async () => {
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test"></copy-button>',
    });
    const button = page.root.querySelector('button');
    expect(button.textContent).toBe('Copy');
  });

  it('shows success state after copyValue is called', async () => {
    // Mock navigator.clipboard
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="copy-me"></copy-button>',
    });

    // Simulate click with a mock MouseEvent
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    jest.spyOn(clickEvent, 'stopPropagation');
    jest.spyOn(clickEvent, 'preventDefault');

    await page.rootInstance.copyValue(clickEvent);
    await page.waitForChanges();

    expect(writeTextMock).toHaveBeenCalledWith('copy-me');
    expect(page.rootInstance.copied).toBe(true);

    // Button text should change to success state
    const updatedButton = page.root.querySelector('button');
    expect(updatedButton.textContent).toContain('Copied!');
  });

  it('aria-label changes to copied state after successful copy', async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test" label="DOI"></copy-button>',
    });

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    await page.rootInstance.copyValue(clickEvent);
    await page.waitForChanges();

    const button = page.root.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('DOI copied to clipboard');
  });

  it('renders sr-only live region when copied is true', async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test"></copy-button>',
    });

    // Before copy, no sr-only region
    let srOnly = page.root.querySelector('.sr-only');
    expect(srOnly).toBeNull();

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    await page.rootInstance.copyValue(clickEvent);
    await page.waitForChanges();

    srOnly = page.root.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly.getAttribute('aria-live')).toBe('assertive');
    expect(srOnly.textContent).toContain('Content copied to clipboard');
  });

  it('button has correct CSS classes for default state', async () => {
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test"></copy-button>',
    });
    const button = page.root.querySelector('button');
    expect(button.className).toContain('rounded-md');
    expect(button.className).toContain('border');
    expect(button.className).toContain('font-mono');
    expect(button.className).toContain('font-medium');
    // Default (not copied, not dark mode) should include bg-white
    expect(button.className).toContain('bg-white');
  });

  it('button has green background CSS class after successful copy', async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test"></copy-button>',
    });

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    await page.rootInstance.copyValue(clickEvent);
    await page.waitForChanges();

    const button = page.root.querySelector('button');
    expect(button.className).toContain('bg-green-200');
  });

  it('host has inline-block class', async () => {
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test"></copy-button>',
    });
    expect(page.root.className).toContain('inline-block');
  });

  it('copyValue stops event propagation', async () => {
    const writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test"></copy-button>',
    });

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopSpy = jest.spyOn(clickEvent, 'stopPropagation');
    const preventSpy = jest.spyOn(clickEvent, 'preventDefault');

    await page.rootInstance.copyValue(clickEvent);

    expect(stopSpy).toHaveBeenCalled();
    expect(preventSpy).toHaveBeenCalled();
  });

  it('showSuccess sets copied to true then resets', async () => {
    // Create page BEFORE enabling fake timers (newSpecPage uses real timers internally)
    const page = await newSpecPage({
      components: [CopyButton],
      html: '<copy-button value="test"></copy-button>',
    });

    jest.useFakeTimers();

    // Call showSuccess directly to avoid clipboard API issues with fake timers
    page.rootInstance.showSuccess();
    expect(page.rootInstance.copied).toBe(true);

    // Fast-forward 1.5 seconds
    jest.advanceTimersByTime(1500);
    expect(page.rootInstance.copied).toBe(false);

    jest.useRealTimers();
  });
});
