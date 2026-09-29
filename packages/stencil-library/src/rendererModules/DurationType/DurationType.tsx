import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { FoldableItem } from '../../utils/FoldableItem';
import { DurationParts, parseDuration } from '../date-common/iso';
import { formatDurationParts, formatDurationPartsIso } from '../date-common/format';
import '../../components/duration-calculator/duration-calculator';

/**
 * This class specifies a custom renderer for ISO 8601 durations, e.g.
 * `P7DT2H`, `P2W`, or `PT1.5H`.
 *
 * The preview shows a humanized summary (e.g. "7 days, 2 hours") and the body
 * renders an interactive end-datetime calculator that lets a user enter a start
 * datetime and see the computed end datetime.
 * @extends GenericIdentifierType
 */
export class DurationType extends GenericIdentifierType {
  private _parts: DurationParts | null = null;

  getSettingsKey(): string {
    return 'DurationType';
  }

  quickCheck(): boolean {
    return parseDuration(this.value) !== null;
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    return Promise.resolve(this.quickCheck());
  }

  init(): Promise<void> {
    this._parts = parseDuration(this.value);
    if (this._parts) {
      this.populateItems();
    }
    return Promise.resolve();
  }

  renderPreview(): FunctionalComponent<unknown> {
    if (!this._parts) {
      return <span>{this.value}</span>;
    }
    return <span>{formatDurationParts(this._parts)}</span>;
  }

  renderBody(): FunctionalComponent<unknown> {
    if (!this._parts) {
      return undefined;
    }
    return <duration-calculator iso-duration={formatDurationPartsIso(this._parts)} />;
  }

  private populateItems(): void {
    const p = this._parts!;
    const rows: Array<[string, string]> = [];
    if (p.years > 0) rows.push(['Years', String(p.years)]);
    if (p.months > 0) rows.push(['Months', String(p.months)]);
    if (p.weeks > 0) rows.push(['Weeks', String(p.weeks)]);
    if (p.days > 0) rows.push(['Days', String(p.days)]);
    if (p.hours > 0) rows.push(['Hours', String(p.hours)]);
    if (p.minutes > 0) rows.push(['Minutes', String(p.minutes)]);
    if (p.seconds > 0) rows.push(['Seconds', String(p.seconds)]);

    rows.forEach(([title, value], i) => {
      this.items.push(new FoldableItem(i, title, value, `Duration ${title.toLowerCase()}`, undefined, undefined, false));
    });
  }
}
