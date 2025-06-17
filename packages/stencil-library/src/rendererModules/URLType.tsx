// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer for URLs.
 * @extends GenericIdentifierType
 */
export class URLType extends GenericIdentifierType {
  getSettingsKey(): string {
    return 'URLType';
  }

  async hasCorrectFormat(): Promise<boolean> {
    const regex = new RegExp('^http(s)?:(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$');
    return regex.test(this.value);
  }

  init(): Promise<void> {
    return;
  }

  renderPreview(): FunctionalComponent {
    return (
      <a href={this.value} target="_blank" rel={'noopener noreferrer'} class={'font-mono text-sm text-blue-400'}>
        {this.value}
      </a>
    );
  }
}
