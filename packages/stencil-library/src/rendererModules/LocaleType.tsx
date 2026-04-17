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

  private static readonly FORMAT_REGEX = /^([a-zA-Z]{2})(-[A-Z]{2})?$/;

  hasCorrectFormatQuick(): boolean {
    return LocaleType.FORMAT_REGEX.test(this.value);
  }

  async hasCorrectFormat(): Promise<boolean> {
    return this.hasCorrectFormatQuick();
  }

  init(): Promise<void> {
    return;
  }

  renderPreview(): FunctionalComponent {
    return <locale-visualization locale={this.value} showFlag={true}></locale-visualization>;
  }
}
