// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer for Email addresses.
 * @extends GenericIdentifierType
 */
export class LocaleType extends GenericIdentifierType {
  getSettingsKey(): string {
    return 'LocaleType';
  }

  async hasCorrectFormat(): Promise<boolean> {
    const regex = /^([a-zA-Z]{2})(-[A-Z]{2})?$/;
    return regex.test(this.value);
  }

  init(): Promise<void> {
    return;
  }

  renderPreview(): FunctionalComponent {
    // Get the dark mode value to pass to the component
    const darkModeValue = (this.settings?.find(setting => setting.name === 'darkMode')?.value as 'light' | 'dark' | 'system') || 'system';

    return <locale-visualization locale={this.value} showFlag={true} darkMode={darkModeValue}></locale-visualization>;
  }
}
