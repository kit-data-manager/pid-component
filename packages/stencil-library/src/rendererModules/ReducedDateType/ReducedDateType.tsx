import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { DateTimeParts, parseReducedDate } from '../date-common/iso';

/**
 * This class specifies a custom renderer for reduced-precision ISO 8601 dates:
 * a year-only value (`2023`) or a year-month value (`2023-01`).
 *
 * This renderer is **not** auto-discoverable by default because a bare year
 * (e.g. `2023`) appears frequently as ordinary text and could be mistaken for
 * a date during auto-detection. It is still used when `DateType` does not match
 * (e.g. via an explicit `renderers` list) or when used directly.
 * @extends GenericIdentifierType
 */
export class ReducedDateType extends GenericIdentifierType {
  private _parts: DateTimeParts;

  getSettingsKey(): string {
    return 'ReducedDateType';
  }

  quickCheck(): boolean {
    return parseReducedDate(this.value) !== null;
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    return Promise.resolve(this.quickCheck());
  }

  init(): Promise<void> {
    const parts = parseReducedDate(this.value);
    this._parts = parts ?? { date: this.value, year: 0, hasTime: false, isReduced: true };
    return Promise.resolve();
  }

  renderPreview(): FunctionalComponent<unknown> {
    const p = this._parts;
    if (p.month !== undefined) {
      // Year-month, e.g. `2023-01`.
      return (
        <span>
          {new Date(p.year, p.month - 1, 1).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
        </span>
      );
    }
    return <span>{p.year}</span>;
  }
}
