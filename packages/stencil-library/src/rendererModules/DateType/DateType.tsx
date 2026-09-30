import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { parseDatetime } from '../date-common/iso';
import { Temporal } from '../date-common/temporal';

/**
 * This class specifies a custom renderer for dates.
 * It accepts full ISO 8601 / RFC 3339 datetimes (with or without an explicit
 * timezone) and calendar dates (`YYYY-MM-DD`). Reduced-precision forms
 * (`YYYY`, `YYYY-MM`) are intentionally left to `ReducedDateType`, and
 * durations are handled by `DurationType`.
 * @extends GenericIdentifierType
 */
export class DateType extends GenericIdentifierType {
  /**
   * The parsed date object (a JS `Date`).
   * @type {Date}
   * @private
   */
  private _date: Date;

  /**
   * Whether the parsed value includes a time component.
   * @private
   */
  private _hasTime: boolean = false;

  getSettingsKey(): string {
    return 'DateType';
  }

  quickCheck(): boolean {
    return parseDatetime(this.value) !== null;
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    return Promise.resolve(this.quickCheck());
  }

  init(): Promise<void> {
    const parts = parseDatetime(this.value);
    if (parts !== null) {
      this._hasTime = parts.hasTime;

      // A date-only value (no time component) is a calendar date; parse it in
      // local time so the displayed day doesn't shift across timezones.
      if (!parts.hasTime) {
        this._date = new Date(parts.year, parts.month! - 1, parts.day!);
      } else if (parts.timezoneOffsetMinutes !== undefined) {
        // Datetime with an explicit timezone: interpret as an absolute moment.
        try {
          const absolute = Temporal.Instant.from(this.value);
          this._date = new Date(Number(absolute.epochMilliseconds));
        } catch {
          this._date = new Date(this.value);
        }
      } else {
        // Datetime without a timezone: treat as local wall-clock time.
        const match = parts.time?.match(/^(\d{2}):(\d{2}):(\d{2})(\.\d+)?/);
        const hour = match ? Number(match[1]) : 0;
        const minute = match ? Number(match[2]) : 0;
        const second = match ? Number(match[3]) : 0;
        const milli = match && match[4] ? Number(match[4].slice(1).padEnd(3, '0').slice(0, 3)) : 0;
        this._date = new Date(parts.year, parts.month! - 1, parts.day!, hour, minute, second, milli);
      }
    }
    return Promise.resolve();
  }

  renderPreview(): FunctionalComponent<unknown> {
    if (!this._date || Number.isNaN(this._date.getTime())) {
      return <span>{this.value}</span>;
    }
    const formatted = this._hasTime ? this._date.toLocaleString() : this._date.toLocaleDateString();
    return <span>{formatted}</span>;
  }
}
