import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer for URLs.
 * @extends GenericIdentifierType
 */
export class URLType extends GenericIdentifierType {
  getSettingsKey(): string {
    return 'URLType';
  }

  private static readonly FORMAT_REGEX = new RegExp('^http(s)?:(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$');

  quickCheck(): boolean {
    return URLType.FORMAT_REGEX.test(this.value);
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    return Promise.resolve(true);
  }

  init(): Promise<void> {
    return Promise.resolve();
  }

  renderPreview(): FunctionalComponent {
    return (
      <a href={this.value} target="_blank" rel={'noopener noreferrer'} class={`font-mono text-sm text-blue-400`}>
        {this.value}
      </a>
    );
  }
}
