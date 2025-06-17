// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer for Email addresses.
 * @extends GenericIdentifierType
 */
export class EmailType extends GenericIdentifierType {
  // Dark mode property
  private isDarkMode: boolean = false;

  getSettingsKey(): string {
    return 'EmailType';
  }

  async hasCorrectFormat(): Promise<boolean> {
    const regex = /^(([\w\-.]+@([\w-]+\.)+[\w-]{2,})(\s*,\s*)?)*$/gm;
    return regex.test(this.value);
  }

  init(): Promise<void> {
    return;
  }

  // Check for dark mode in settings
  private checkDarkMode(): boolean {
    const darkModeSetting = this.settings?.find(setting => setting.name === 'darkMode');
    if (darkModeSetting) {
      const darkMode = darkModeSetting.value as 'light' | 'dark' | 'system';
      if (darkMode === 'dark') {
        return true;
      } else if (darkMode === 'light') {
        return false;
      } else if (darkMode === 'system' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    return false;
  }

  renderPreview(): FunctionalComponent {
    // Update dark mode state
    this.isDarkMode = this.checkDarkMode();

    // mail icon from: https://heroicons.com/ (MIT license)
    return (
      <span class={`inline-flex items-center gap-2 font-mono text-sm ${this.isDarkMode ? 'text-blue-300' : 'text-blue-400'}`}>
        {this.value
          .split(new RegExp(/\s*,\s*/))
          .filter(email => email.length > 0)
          .map(email => {
            return (
              <a
                href={'mailto:' + email}
                rel={'noopener noreferrer'}
                target="_blank"
                class={`inline-flex items-center rounded-md border ${this.isDarkMode ? 'border-slate-600' : 'border-slate-400'} px-1 py-0.5 font-mono text-sm ${this.isDarkMode ? 'text-blue-300' : 'text-blue-400'}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  stroke-width="1"
                  stroke={this.isDarkMode ? 'white' : 'black'}
                  height="20px"
                  class={'mr-2'}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                <span class={`ml-2 ${this.isDarkMode ? 'text-blue-300 hover:text-blue-400' : 'text-blue-400 hover:text-blue-500'}`}>{email}</span>
              </a>
            );
          })}
      </span>
    );
  }
}
