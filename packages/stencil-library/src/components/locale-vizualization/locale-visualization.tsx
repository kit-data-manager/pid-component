// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, h, Host, Prop } from '@stencil/core';

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
        <span>{getLocaleDetail(this.locale)}</span>
      </Host>
    );
  }
}
