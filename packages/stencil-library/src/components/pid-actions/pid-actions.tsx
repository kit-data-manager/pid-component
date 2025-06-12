import { Component, h, Prop } from '@stencil/core';
import { FoldableAction } from '../../utils/FoldableAction';

@Component({
  tag: 'pid-actions',
  // shadow: false,
})
export class PidActions {
  /**
   * Array of actions to display
   */
  @Prop() actions: FoldableAction[] = [];

  render() {
    if (this.actions.length === 0) {
      return null;
    }

    return (
      <div class="actions-container sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-1 z-20 mt-auto w-full">
        <span class={'flex justify-between gap-1 flex-wrap'}>
          {this.actions.map(action => {
            // Use Tailwind classes directly instead of concatenating strings
            const baseClasses = 'p-1 font-semibold text-sm rounded border';
            let styleClasses = '';

            switch (action.style) {
              case 'primary':
                styleClasses = 'bg-blue-500 text-white';
                break;
              case 'secondary':
                styleClasses = 'bg-slate-200 text-blue-500';
                break;
              case 'danger':
                styleClasses = 'bg-red-500 text-white';
                break;
            }

            return (
              <a key={`action-${action.title}`} href={action.link} class={`${baseClasses} ${styleClasses}`} rel={'noopener noreferrer'} target={'_blank'}>
                {action.title}
              </a>
            );
          })}
        </span>
      </div>
    );
  }
}
