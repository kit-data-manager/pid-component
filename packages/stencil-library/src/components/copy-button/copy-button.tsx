import { Component, h, Host, Prop, State } from '@stencil/core';

@Component({
  tag: 'copy-button',
  shadow: false,
})
export class CopyButton {
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
   * Copies the given value to the clipboard and updates the state to show success message.
   */
  private copyValue = async (event: MouseEvent) => {
    // Stop event propagation to prevent parent elements from handling the click
    event.stopPropagation();
    event.preventDefault();

    console.log('Copying value:', this.value);

    try {
      // Try the Async Clipboard API first
      if ('clipboard' in navigator) {
        try {
          await navigator.clipboard.writeText(this.value);
          console.debug('Copied to clipboard using Async Clipboard API:', this.value);
          this.showSuccess();
          return;
        } catch (err) {
          console.error('Async Clipboard API failed, falling back to execCommand:', err);
          // Fall through to execCommand fallback
        }
      }

      // Fallback to execCommand for all browsers including Mac
      const textArea = document.createElement('textarea');
      textArea.value = this.value;

      // Add to DOM with Tailwind classes for positioning
      textArea.className = 'fixed top-0 left-0 opacity-0 pointer-events-none z-[9999] w-[10em] h-[10em]';

      document.body.appendChild(textArea);

      // Focus and select need to happen after the element is in the DOM
      // Increased timeout to ensure the element is properly rendered
      setTimeout(() => {
        textArea.focus();
        textArea.select();

        try {
          const success = document.execCommand('copy');
          console.log(`execCommand copy was ${success ? 'successful' : 'unsuccessful'}.`);
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
              console.log(`Second attempt execCommand copy was ${secondAttempt ? 'successful' : 'unsuccessful'}.`);
              if (secondAttempt) {
                this.showSuccess();
              }
            }
          }
        } catch (err) {
          console.error('Failed to copy text with execCommand:', err);
        } finally {
          document.body.removeChild(textArea);
        }
      }, 200); // Increased timeout for better reliability
    } catch (err) {
      console.error('Failed to copy text:', err);
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

  render() {
    return (
      <Host class={'inline-block align-baseline text-xs'}>
        <button
          class={`${this.copied ? 'bg-green-200' : 'bg-white hover:bg-blue-200'} border border-slate-500 text-slate-800 font-medium font-mono rounded-md px-2 py-0.5 hover:text-slate-900 flex-none max-h-min items-center z-30 relative`}
          onClick={e => this.copyValue(e)}
          aria-label={this.copied ? 'Copied to clipboard' : 'Copy to clipboard'}
          type="button"
        >
          {this.copied ? '✓ Copied!' : 'Copy'}
        </button>
      </Host>
    );
  }
}
