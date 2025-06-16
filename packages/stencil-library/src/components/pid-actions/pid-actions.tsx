// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  /**
   * Optional ID for the actions container for ARIA references
   */
  @Prop() actionsId?: string;

  render() {
    if (this.actions.length === 0) {
      return null;
    }

    // Generate a unique ID for this actions container if not provided
    const containerId = this.actionsId || `actions-${Math.random().toString(36).substring(2, 11)}`;

    return (
      <div
        id={containerId}
        class="actions-container sticky right-0 bottom-0 left-0 z-20 mt-auto w-full border-t border-gray-200 bg-white p-1"
        role="toolbar"
        aria-label="Available actions"
      >
        {/* Hidden description for screen readers */}
        <span id={`${containerId}-desc`} class="sr-only">
          The following links open related resources in new tabs
        </span>

        <div class="flex flex-wrap justify-between gap-1" aria-describedby={`${containerId}-desc`}>
          {this.actions.map((action, index) => {
            // Use Tailwind classes directly instead of concatenating strings
            const baseClasses = 'p-1 font-semibold text-sm rounded border transition-colors duration-200';
            const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500';
            let styleClasses: string;

            switch (action.style) {
              case 'primary':
                styleClasses = 'bg-blue-500 text-white hover:bg-blue-600';
                break;
              case 'secondary':
                styleClasses = 'bg-slate-200 text-blue-500 hover:bg-slate-300';
                break;
              case 'danger':
                styleClasses = 'bg-red-500 text-white hover:bg-red-600';
                break;
              default:
                styleClasses = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
            }

            return (
              <a
                key={`action-${action.title}-${index}`}
                href={action.link}
                class={`${baseClasses} ${styleClasses} ${focusClasses}`}
                rel="noopener noreferrer"
                target="_blank"
                aria-label={`${action.title} (opens in new tab)`}
                title={`${action.title} - Opens in a new tab`}
              >
                <span>{action.title}</span>
                {/* Visually hidden text for screen readers to indicate external link */}
                <span class="sr-only">(opens in new tab)</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  }
}
