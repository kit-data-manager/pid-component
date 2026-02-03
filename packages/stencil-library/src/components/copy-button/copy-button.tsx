// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  /**
   * Copies the given value to the clipboard and updates the state to show success message.
   */
  private copyValue = async (event: MouseEvent) => {
    // Stop event propagation to prevent parent elements from handling the click
    event.stopPropagation();
    event.preventDefault();

    try {
      // Try the Async Clipboard API first
      if ('clipboard' in navigator) {
        try {
          await navigator.clipboard.writeText(this.value);
          this.showSuccess();
          return;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (ignored) {
          // Fall through to execCommand fallback
        }
      }

      // Fallback to execCommand for all browsers including Mac
      const textArea = document.createElement('textarea');
      textArea.value = this.value;

      // Add accessibility attributes and Tailwind classes for positioning
      textArea.setAttribute('aria-hidden', 'true');
      textArea.setAttribute('tabindex', '-1');
      textArea.setAttribute('readonly', 'readonly');
      textArea.className = 'fixed top-0 left-0 opacity-0 pointer-events-none z-[9999] w-[10em] h-[10em]';

      document.body.appendChild(textArea);

      // Focus and select need to happen after the element is in the DOM
      // Increased timeout to ensure the element is properly rendered
      setTimeout(() => {
        textArea.focus();
        textArea.select();

        try {
          const success = document.execCommand('copy');
          if (success) {
            this.showSuccess();
          } else {
            // If execCommand fails, try one more time with a different approach
            const range = document.createRange();
            range.selectNodeContents(textArea);
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
              textArea.setSelectionRange(0, textArea.value.length); // For mobile devices

              const secondAttempt = document.execCommand('copy');
              if (secondAttempt) {
                this.showSuccess();
              }
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (ignored) {
          // Error handling is silent to not disrupt user experience
        } finally {
          document.body.removeChild(textArea);
        }
      }, 200); // Increased timeout for better reliability
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Error handling is silent to not disrupt user experience
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
}
