// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, h, Host, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'locale-visualization',
  shadow: false,
})
export class LocaleVisualization {
  /**
   * The locale to visualize.
   * @type {string}
   * @public
   */
  @Prop() locale!: string;

  /**
   * Whether to show the flag of the region.
   * @type {boolean}
   * @public
   */
  @Prop() showFlag: boolean = true;

  /**
   * The dark mode setting for the component
   * Options: "light", "dark", "system"
   * Default: "system"
   * @type {string}
   */
  @Prop() darkMode: 'light' | 'dark' | 'system' = 'system';

  /**
   * Tracks the effective dark mode state (true for dark, false for light)
   */
  @State() isDarkMode: boolean = false;

  // Media query for detecting system dark mode preference
  private darkModeMediaQuery: MediaQueryList;

  /**
   * Watch for changes in the darkMode property
   */
  @Watch('darkMode')
  watchDarkMode() {
    this.updateDarkMode();
  }

  componentWillLoad() {
    // Initialize dark mode
    this.initializeDarkMode();
  }

  disconnectedCallback() {
    // Clean up dark mode media query listener
    this.cleanupDarkModeListener();
  }

  /**
   * Initializes dark mode based on property and system preference
   */
  private initializeDarkMode() {
    // Check if the browser supports matchMedia
    if (window.matchMedia) {
      // Create media query for dark mode
      this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Set initial dark mode state
      this.updateDarkMode();

      // Add listener for system preference changes
      if (this.darkModeMediaQuery.addEventListener) {
        this.darkModeMediaQuery.addEventListener('change', this.handleDarkModeChange);
      } else if (this.darkModeMediaQuery.addListener) {
        // For older browsers
        this.darkModeMediaQuery.addListener(this.handleDarkModeChange);
      }
    } else {
      // Default to light mode if matchMedia is not supported
      this.isDarkMode = this.darkMode === 'dark';
    }
  }

  /**
   * Handles changes in system dark mode preference
   */
  private handleDarkModeChange = () => {
    this.updateDarkMode();
  };

  /**
   * Updates the dark mode state based on property and system preference
   */
  private updateDarkMode() {
    if (this.darkMode === 'dark') {
      this.isDarkMode = true;
    } else if (this.darkMode === 'light') {
      this.isDarkMode = false;
    } else if (this.darkMode === 'system' && this.darkModeMediaQuery) {
      this.isDarkMode = this.darkModeMediaQuery.matches;
    }
  }

  /**
   * Cleans up dark mode media query listener
   */
  private cleanupDarkModeListener() {
    if (this.darkModeMediaQuery) {
      if (this.darkModeMediaQuery.removeEventListener) {
        this.darkModeMediaQuery.removeEventListener('change', this.handleDarkModeChange);
      } else if (this.darkModeMediaQuery.removeListener) {
        // For older browsers
        this.darkModeMediaQuery.removeListener(this.handleDarkModeChange);
      }
    }
  }

  render() {
    const getLocaleDetail = (locale: string): string => {
      const userLocale = [navigator.language.split('-')[0]];
      const type = locale.split('-').length > 1 ? 'language' : 'region';
      const friendlyName = new Intl.DisplayNames(userLocale, { type: type }).of(locale.toUpperCase());
      if (friendlyName == locale.toUpperCase()) {
        return new Intl.DisplayNames(userLocale, { type: 'language' }).of(locale.toUpperCase());
      }
      if (type === 'language') {
        const flag = generateFlag(locale.split('-')[1]);
        return `${flag}${friendlyName}`;
      }
      return `${generateFlag(locale)}${friendlyName}`;
    };

    const generateFlag = (locale: string): string => {
      if (this.showFlag === false) return '';
      const codePoints = locale
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints) + ' ';
    };

    return (
      <Host>
        <span class={this.isDarkMode ? 'text-gray-200' : ''}>{getLocaleDetail(this.locale)}</span>
      </Host>
    );
  }
}
