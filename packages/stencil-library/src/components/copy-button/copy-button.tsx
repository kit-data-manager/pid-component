import { Component, Element, h, Host, Prop, State } from '@stencil/core';

@Component({
  tag: 'copy-button',
  shadow: false,
})
export class CopyButton {
  @Element() el: HTMLElement;
  /**
   * Internal state to track if copy was successful
   */
  @State() copied: boolean = false;

  /**
   * The value to copy to the clipboard.
   * @type {string}
   * @public
   */
  @Prop() value!: string;

  /**
   * Optional custom label for the button.
   * If not provided, a default label will be used.
   * @type {string}
   * @public
   */
  @Prop() label?: string;

  render() {
    // Determine button text based on state
    const buttonText = this.copied ? '✓ Copied!' : 'Copy';

    // Get appropriate aria-label
    const ariaLabel = this.getAriaLabel();

    // Check if dark mode is active by looking at the closest pid-component
    const parentComponent = this.el.closest('pid-component');
    const isDarkMode = parentComponent?.classList.contains('bg-gray-800');

    return (
      <Host class={'inline-block align-baseline text-xs'}>
        {/* Hidden live region for screen readers */}
        {this.copied && (
          <span class="sr-only" aria-live="assertive">
            Content copied to clipboard
          </span>
        )}

        <button
          class={`${
            this.copied ? (isDarkMode ? 'bg-green-700' : 'bg-green-200') : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-blue-200'
          } relative z-30 max-h-min flex-none items-center rounded-md border ${
            isDarkMode ? 'border-gray-600 text-gray-200 hover:text-white' : 'border-slate-500 text-slate-800 hover:text-slate-900'
          } px-2 py-0.5 font-mono font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-hidden`}
          onClick={e => this.copyValue(e)}
          aria-label={ariaLabel}
          title={ariaLabel}
          type="button"
        >
          {buttonText}
        </button>
      </Host>
    );
  }

  /**
   * Copies the given value to the clipboard and updates the state to show success message.
   *
   * Safari requires the copy to happen synchronously within the user gesture.
   * Using setTimeout or awaiting navigator.clipboard.writeText() can cause
   * Safari to lose the user-gesture context and reject the copy.
   */
  private copyValue = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    // Synchronous execCommand approach — works in all browsers including Safari.
    // We do this FIRST (synchronously) to preserve the user-gesture context.
    const textArea = document.createElement('textarea');
    textArea.value = this.value;
    textArea.setAttribute('aria-hidden', 'true');
    textArea.setAttribute('readonly', 'readonly');
    // Position off-screen but within the viewport so Safari allows selection
    textArea.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;opacity:0;';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    // Safari on iOS needs setSelectionRange
    textArea.setSelectionRange(0, textArea.value.length);

    let copied = false;
    try {
      copied = document.execCommand('copy');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // Silently ignore
    }
    document.body.removeChild(textArea);

    if (copied) {
      this.showSuccess();
      return;
    }

    // Async fallback: navigator.clipboard API (non-Safari browsers)
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(this.value).then(
        () => this.showSuccess(),
        () => { /* silent failure */
        },
      );
    }
  };

  /**
   * Shows the success message for 1.5 seconds.
   */
  private showSuccess() {
    this.copied = true;

    // Reset the button after 1.5 seconds.
    setTimeout(() => {
      this.copied = false;
    }, 1500);
  }

  /**
   * Get the appropriate aria-label based on component state and props
   */
  private getAriaLabel(): string {
    const baseLabel = this.label || 'content';
    return this.copied ? `${baseLabel} copied to clipboard` : `Copy ${baseLabel} to clipboard`;
  }
}
