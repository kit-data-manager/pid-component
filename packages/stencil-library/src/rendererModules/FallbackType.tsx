import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer used as a fallback for all types that are not supported.
 * @extends GenericIdentifierType
 */
export class FallbackType extends GenericIdentifierType {
  hasCorrectFormat(): boolean {
    return true;
  }

  init(): Promise<void> {
    return;
  }

  isResolvable(): boolean {
    return false;
  }

  renderPreview(): FunctionalComponent<any> {
    return <span>{this.value}</span>;
  }

  getSettingsKey(): string {
    return 'FallbackType';
  }
}
