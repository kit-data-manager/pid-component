import { Component, h, Prop } from '@stencil/core';
import { FoldableAction } from '../../utils/FoldableAction';

@Component({
  tag: 'pid-actions',
  shadow: false,
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
      <div class="actions-container sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-1 z-20 mt-auto">
        <span class={'flex justify-between gap-1'}>
          {this.actions.map(action => {
            let style = 'p-1 font-semibold text-sm rounded border ';
            switch (action.style) {
              case 'primary':
                style += 'bg-blue-500 text-white';
                break;
              case 'secondary':
                style += 'bg-slate-200 text-blue-500';
                break;
              case 'danger':
                style += 'bg-red-500 text-white';
                break;
            }

            return (
              <a key={`action-${action.title}`} href={action.link} class={style} rel={'noopener noreferrer'} target={'_blank'}>
                {action.title}
              </a>
            );
          })}
        </span>
      </div>
    );
  }
}
