import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer for Email addresses.
 * @extends GenericIdentifierType
 */
export class LocaleType extends GenericIdentifierType {
  getSettingsKey(): string {
    return 'LocaleType';
  }

  private static readonly FORMAT_REGEX = /^([a-zA-Z]{2})(-[A-Z]{2})?$/;

  quickCheck(): boolean {
    return LocaleType.FORMAT_REGEX.test(this.value);
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    return Promise.resolve(true);
  }

  init(): Promise<void> {
    return Promise.resolve();
  }

  renderPreview(): FunctionalComponent {
    return <locale-visualization locale={this.value} showFlag={true} class={'align-baseline'}></locale-visualization>;
  }
}
