import { render, h } from '@stencil/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

void h;

import { FoldableAction } from '../../../utils/FoldableAction';

const origCreateElement = document.createElement.bind(document);

function createMockedTextArea() {
  const textarea = origCreateElement('textarea');
  (textarea as any).select = vi.fn();
  (textarea as any).setSelectionRange = vi.fn();
  (textarea as any).focus = vi.fn();
  return textarea;
}

function patchTextAreaCreation() {
  (document as any).createElement = ((tag: string) => {
    if (tag === 'textarea') {
      return createMockedTextArea();
    }
    return origCreateElement(tag);
  }) as typeof document.createElement;
}

function restoreTextAreaCreation() {
  (document as any).createElement = origCreateElement;
}

function mockClipboard() {
  const writeTextMock = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    writable: true,
    configurable: true,
  });
  return writeTextMock;
}

async function clickCopyButton(root: HTMLElement, waitForChanges: () => Promise<void>) {
  const button = root.querySelector('button');
  if (!button) return;
  const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
  button.dispatchEvent(clickEvent);
  await new Promise(r => setTimeout(r, 0));
  await waitForChanges();
}

describe('copy-button browser test', () => {
  beforeEach(() => {
    patchTextAreaCreation();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    restoreTextAreaCreation();
  });

  it('renders copy-button with value prop', async () => {
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
    const updatedButton = root.querySelector('button');
    expect(updatedButton.textContent).toContain('Copied!');
  });

  it('button has correct CSS classes for default state', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button.className).toContain('rounded-md');
    expect(button.className).toContain('border');
  });

  it('host has inline-block class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root.className).toContain('inline-block');
  });
});

describe('pid-actions browser test', () => {
  it('renders with actions prop', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-ACTIONS');
  });

  it('renders empty when no actions', async () => {
    const { root } = await render(<pid-actions></pid-actions>);
    expect(root.innerHTML).toBe('');
  });

  it('shows action links', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();
    const links = root.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain('View');
    expect(links[0].getAttribute('href')).toBe('https://example.com');
  });

  it('all action links open in new tab', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View', 'https://example.com', 'primary'),
    ];
    await waitForChanges();
    const links = root.querySelectorAll('a');
    links.forEach(link => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  it('primary style applies blue CSS classes in light mode', async () => {
    const { root, waitForChanges } = await render(<pid-actions dark-mode="light"></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Primary', 'https://example.com', 'primary'),
    ];
    await waitForChanges();
    const link = root.querySelector('a');
    expect(link.className).toContain('bg-blue-500');
  });

  it('action links have correct aria-label', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'View Resource', 'https://example.com', 'primary'),
    ];
    await waitForChanges();
    const link = root.querySelector('a');
    expect(link.getAttribute('aria-label')).toBe('View Resource (opens in new tab)');
  });

  it('container has toolbar role', async () => {
    const { root, waitForChanges } = await render(<pid-actions></pid-actions>);
    root.actions = [
      new FoldableAction(0, 'Action', 'https://example.com', 'primary'),
    ];
    await waitForChanges();
    const container = root.querySelector('[role="toolbar"]');
    expect(container).toBeTruthy();
  });
});

describe('pid-tooltip browser test', () => {
  it('renders with text prop', async () => {
    const { root } = await render(<pid-tooltip text="Tooltip content"></pid-tooltip>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-TOOLTIP');
  });

  it('sets the text prop correctly', async () => {
    const { root } = await render(<pid-tooltip text="Some info"></pid-tooltip>);
    expect(root.text).toBe('Some info');
  });

  it('has correct default position prop', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    expect(root.position).toBe('top');
  });

  it('has correct default maxWidth prop', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    expect(root.maxWidth).toBe('250px');
  });

  it('position prop can be set to bottom', async () => {
    const { root } = await render(<pid-tooltip text="test" position="bottom"></pid-tooltip>);
    expect(root.position).toBe('bottom');
  });
});

describe('locale-visualization browser test', () => {
  beforeEach(() => {
    if (typeof navigator !== 'undefined') {
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        writable: true,
        configurable: true,
      });
    }
    if (typeof Intl === 'undefined' || !Intl.DisplayNames) {
      (globalThis as any).Intl = {
        ...(globalThis as any).Intl,
        DisplayNames: class {
          constructor(_locales: string[], _options: any) {
          }

          of(code: string) {
            return code;
          }
        },
      };
    }
  });

  it('renders with locale prop', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('LOCALE-VISUALIZATION');
  });

  it('sets the locale prop correctly', async () => {
    const { root } = await render(<locale-visualization locale="de"></locale-visualization>);
    expect(root.locale).toBe('de');
  });

  it('renders with region locale', async () => {
    const { root } = await render(<locale-visualization locale="en-US"></locale-visualization>);
    expect(root.locale).toBe('en-US');
  });

  it('showFlag defaults to true', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    expect(root.showFlag).toBe(true);
  });
});
