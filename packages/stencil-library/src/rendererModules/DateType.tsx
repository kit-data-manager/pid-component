import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer for dates.
 * @extends GenericIdentifierType
 */
export class DateType extends GenericIdentifierType {
  /**
   * The date object.
   * @type {Date}
   * @private
   */
  private _date: Date;

  getSettingsKey(): string {
    return 'DateType';
  }

  hasCorrectFormat(): boolean {
    const regex = new RegExp(
      '^([0-9]{4})-([0]?[1-9]|1[0-2])-([0-2][0-9]|3[0-1])(T([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9](.[0-9]*)?(Z|([+|-]([0-1][0-9]|2[0-3]):[0-5][0-9])){1}))$',
    );
    return regex.test(this.value);
  }

  init(): Promise<void> {
    this._date = new Date(this.value);
    return;
  }

  isResolvable(): boolean {
    return false;
  }

  renderPreview(): FunctionalComponent<any> {
    return <span>{this._date.toLocaleString()}</span>;
  }
}
