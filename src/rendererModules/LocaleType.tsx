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
    // const regex = /^[A-Za-z]{2,4}([_-][A-Za-z]{4})?([_-]([A-Za-z]{2}|[0-9]{3}))?$/
    const regex = /^[a-z]{2}(-[A-Z]{2})?$/
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
    return (
      <locale-visualization locale={this.value} showFlag={true}></locale-visualization>
    );
  }
}
