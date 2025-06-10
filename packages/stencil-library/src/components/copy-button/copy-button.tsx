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

      // Make the textarea part of the visible DOM to ensure it works on all platforms
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      textArea.style.zIndex = '9999'; // Ensure it's above other elements

      document.body.appendChild(textArea);

      // Focus and select need to happen after the element is in the DOM
      setTimeout(() => {
        textArea.focus();
        textArea.select();

        try {
          const success = document.execCommand('copy');
          console.log(`execCommand copy was ${success ? 'successful' : 'unsuccessful'}.`);
          if (success) {
            this.showSuccess();
          }
        } catch (err) {
          console.error('Failed to copy text with execCommand:', err);
        } finally {
          document.body.removeChild(textArea);
        }
      }, 100);
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
