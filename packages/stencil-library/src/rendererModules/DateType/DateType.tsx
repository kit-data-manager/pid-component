import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer for dates.
 * @extends GenericIdentifierType
 */
export class DateType extends GenericIdentifierType {
  // Matches a full RFC 3339/ISO 8601 datetime with timezone, or a plain
  // calendar date (YYYY-MM-DD). Reduced-precision forms (YYYY, YYYY-MM) are
  // intentionally not detected so bare years aren't treated as dates.
  private static readonly FORMAT_REGEX = new RegExp(
    '^([0-9]{4})-([0]?[1-9]|1[0-2])-([0-2][0-9]|3[0-1])(T([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9](.[0-9]*)?(Z|([+|-]([0-1][0-9]|2[0-3]):[0-5][0-9])){1}))?$',
  );
  /**
   * The date object.
   * @type {Date}
   * @private
   */
  private _date: Date;

  getSettingsKey(): string {
    return 'DateType';
  }

  quickCheck(): boolean {
    return DateType.FORMAT_REGEX.test(this.value);
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    return Promise.resolve(this.quickCheck());
  }

  init(): Promise<void> {
    // A date-only value (no time component) is a calendar date; parse it in
    // local time so the displayed day doesn't shift across timezones.
    if (DateType.FORMAT_REGEX.test(this.value) && !/T/.test(this.value)) {
      const [year, month, day] = this.value.split('-').map(Number);
      this._date = new Date(year, month - 1, day);
    } else {
      this._date = new Date(this.value);
    }
    return Promise.resolve();
  }

  renderPreview(): FunctionalComponent {
    return <span>{this._date.toLocaleString()}</span>;
  }
}
