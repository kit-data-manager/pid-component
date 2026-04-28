import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer used as a fallback for all types that are not supported.
 * @extends GenericIdentifierType
 */
export class FallbackType extends GenericIdentifierType {
  quickCheck(): boolean {
    return true;
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    return Promise.resolve(true);
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
