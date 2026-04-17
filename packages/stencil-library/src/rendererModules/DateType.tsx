// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  private static readonly FORMAT_REGEX = new RegExp(
    '^([0-9]{4})-([0]?[1-9]|1[0-2])-([0-2][0-9]|3[0-1])(T([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9](.[0-9]*)?(Z|([+|-]([0-1][0-9]|2[0-3]):[0-5][0-9])){1}))$',
  );

  hasCorrectFormatQuick(): boolean {
    return DateType.FORMAT_REGEX.test(this.value);
  }

  async hasCorrectFormat(): Promise<boolean> {
    return this.hasCorrectFormatQuick();
  }

  init(): Promise<void> {
    this._date = new Date(this.value);
    return;
  }

  renderPreview(): FunctionalComponent {
    return <span>{this._date.toLocaleString()}</span>;
  }
}
