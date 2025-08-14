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

  /**
   * The dark mode setting for the component
   * Options: "light", "dark", "system"
   * Default: "system"
   */
  @Prop() darkMode: 'light' | 'dark' | 'system' = 'system';

  render() {
    if (this.actions.length === 0) {
      return null;
    }

    // Check if dark mode is active
    const isDarkMode = this.darkMode === 'dark' || (this.darkMode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Generate a unique ID for this actions container if not provided
    const containerId = this.actionsId || `actions-${Math.random().toString(36).substring(2, 11)}`;

    return (
      <div
        id={containerId}
        class={`actions-container sticky right-0 bottom-0 left-0 z-20 w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
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

            if (isDarkMode) {
              switch (action.style) {
                case 'primary':
                  styleClasses = 'bg-blue-700 text-white hover:bg-blue-600 border-blue-600';
                  break;
                case 'secondary':
                  styleClasses = 'bg-slate-700 text-blue-300 hover:bg-slate-600 border-slate-600';
                  break;
                case 'danger':
                  styleClasses = 'bg-red-700 text-white hover:bg-red-600 border-red-600';
                  break;
                default:
                  styleClasses = 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600';
              }
            } else {
              switch (action.style) {
                case 'primary':
                  styleClasses = 'bg-blue-500 text-white hover:bg-blue-600 border-blue-400';
                  break;
                case 'secondary':
                  styleClasses = 'bg-slate-200 text-blue-500 hover:bg-slate-300 border-slate-300';
                  break;
                case 'danger':
                  styleClasses = 'bg-red-500 text-white hover:bg-red-600 border-red-400';
                  break;
                default:
                  styleClasses = 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300';
              }
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
