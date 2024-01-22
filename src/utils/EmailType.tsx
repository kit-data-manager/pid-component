import { GenericIdentifierType } from './GenericIdentifierType';
import { FunctionalComponent, h } from '@stencil/core';

/**
 * This class specifies a custom renderer for Email addresses.
 * @extends GenericIdentifierType
 */
export class EmailType extends GenericIdentifierType {
  getSettingsKey(): string {
    return 'DateType';
  }

  hasCorrectFormat(): boolean {
    return true;
    //const regex = new RegExp('(\w|\(|\)|\.|\"|\(|\)|,|:|;|<|>|@|\[|\]|\\|!|#|\$|%|&|\'|\*|\+|-|/|\?|\^|`|{|\||}|~)+@((((\(.*\))?\w+(\(.*\))?\.)+(\(.*\))?\w+(\(.*\))?\w+)|(\[((IPv6:((\w+:+)+\w+))|(\d+\.)+\d+)\]))$');
    //return regex.test(this.value);
  }

  init(): Promise<void> {
    return;
  }

  isResolvable(): boolean {
    return false;
  }

  renderPreview(): FunctionalComponent<any> {
    return (
      <a href={'mailto:' + this.value} target="_blank" class={'font-mono text-sm text-blue-400'}>
        {this.value}
      </a>
    );
  }
}
