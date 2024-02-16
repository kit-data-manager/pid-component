import { GenericIdentifierType } from './GenericIdentifierType';
import { FunctionalComponent, h } from '@stencil/core';

/**
 * This class specifies a custom renderer for URLs.
 * @extends GenericIdentifierType
 */
export class URLType extends GenericIdentifierType {
  getSettingsKey(): string {
    return 'URLType';
  }

  hasCorrectFormat(): boolean {
    const regex = new RegExp('^http(s)?:(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$');
    return regex.test(this.value);
  }

  init(): Promise<void> {
    return;
  }

  isResolvable(): boolean {
    return false;
  }

  renderPreview(): FunctionalComponent<any> {
    return (
      <a href={this.value} target="_blank" rel={'noopener noreferrer'} class={'font-mono text-sm text-blue-400'}>
        {this.value}
      </a>
    );
  }
}
