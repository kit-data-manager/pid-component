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

  hasCorrectFormat(): boolean {
    const regex = /^([a-zA-Z]{2})(-[A-Z]{2})?$/;
    return regex.test(this.value);
  }

  init(): Promise<void> {
    return;
  }

  isResolvable(): boolean {
    return false;
  }

  renderPreview(): FunctionalComponent<any> {
    // mail icon from: https://heroicons.com/ (MIT license)
    return <locale-visualization locale={this.value} showFlag={true}></locale-visualization>;
  }
}
