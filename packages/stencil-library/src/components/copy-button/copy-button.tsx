import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'copy-button',
  shadow: false,
})
export class CopyButton {
  /**
   * The value to copy to the clipboard.
   * @type {string}
   * @public
   */
  @Prop() value!: string;

  render() {
    /**
     * Copies the given value to the clipboard and changes the text of the button to "✓ Copied!" for 1.5 seconds.
     * @param event The event that triggered this function.
     * @param value The value to copy to the clipboard.
     */
    function copyValue(event: MouseEvent, value: string) {
      if ('clipboard' in navigator) {
        // Use the Async Clipboard API when available.
        navigator.clipboard.writeText(value).then(() => showSuccess());
      } else {
        // ...Otherwise, use document.execCommand() fallback.
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const success = document.execCommand('copy');
          console.debug(`Deprecated Text copy was ${success ? 'successful' : 'unsuccessful'}.`);
          showSuccess();
        } catch (err) {
          console.error(err.name, err.message);
        }
        document.body.removeChild(textArea);
      }

      /**
       * Shows the success message for 1.5 seconds.
       */
      function showSuccess() {
        const el = event.target as HTMLButtonElement;
        el.innerText = '✓ Copied!';
        el.classList.remove('hover:bg-blue-200');
        el.classList.remove('bg-white');
        el.classList.add('bg-green-200');

        // Reset the button after 1.5 seconds.
        setTimeout(() => {
          el.classList.remove('bg-green-200');
          el.classList.add('hover:bg-blue-200');
          el.classList.add('bg-white');
          el.innerText = 'Copy';
        }, 1500);
      }
    }

    return (
      <Host class={'inline-block align-baseline text-xs'}>
        <button
          class={
            'bg-white border border-slate-500 text-slate-800 font-medium font-mono rounded-md px-2 py-0.5 hover:bg-blue-200 hover:text-slate-900 flex-none max-h-min items-center'
          }
          onClick={event => copyValue(event, this.value)}
        >
          Copy
        </button>
      </Host>
    );
  }
}
