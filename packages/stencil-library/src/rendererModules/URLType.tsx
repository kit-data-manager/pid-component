// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer for URLs.
 * @extends GenericIdentifierType
 */
export class URLType extends GenericIdentifierType {
  // Dark mode property
  private isDarkMode: boolean = false;

  getSettingsKey(): string {
    return 'URLType';
  }

  async hasCorrectFormat(): Promise<boolean> {
    const regex = new RegExp('^http(s)?:(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$');
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

    return (
      <a href={this.value} target="_blank" rel={'noopener noreferrer'} class={`font-mono text-sm ${this.isDarkMode ? 'text-blue-300' : 'text-blue-400'}`}>
        {this.value}
      </a>
    );
  }
}
