// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer used as a fallback for all types that are not supported.
 * @extends GenericIdentifierType
 */
export class FallbackType extends GenericIdentifierType {
  async hasCorrectFormat(): Promise<boolean> {
    return true;
  }

  init(): Promise<void> {
    return;
  }

  renderPreview(): FunctionalComponent {
    return <span>{this.value}</span>;
  }

  getSettingsKey(): string {
    return 'FallbackType';
  }
}
