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

  private static readonly FORMAT_REGEX = new RegExp('^http(s)?:(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$');

  hasCorrectFormatQuick(): boolean {
    return URLType.FORMAT_REGEX.test(this.value);
  }

  async hasCorrectFormat(): Promise<boolean> {
    return this.hasCorrectFormatQuick();
  }

  init(): Promise<void> {
    return;
  }

  renderPreview(): FunctionalComponent {
    return (
      <a href={this.value} target="_blank" rel={'noopener noreferrer'} class={`font-mono text-sm text-blue-400`}>
        {this.value}
      </a>
    );
  }
}
