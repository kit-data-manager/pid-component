import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';
import { hyphenate, parse } from 'isbn3';
import {
  AggregatedISBNMetadata,
  ISBNSourceResult,
  DEFAULT_ISBN_SOURCE_PRIORITY,
  aggregateISBNMetadata,
  createDefaultIsbnProviders,
  formatAuthor,
  getProviderAction,
  selectIsbnProviders,
} from './isbnMetadataSources';

interface ISBNCachedData {
  isbn?: string;
  hyphenatedIsbn?: string;
  aggregated?: {
    merged: AggregatedISBNMetadata['merged'];
    sources: ISBNSourceResult[];
  };
}

/**
 * Renderer for ISBN-10 and ISBN-13 identifiers.
 */
export class ISBNType extends GenericIdentifierType {
  private static readonly PREFIX_REGEX = /^ISBN(?:-1[03])?:?\s*/i;
  private static readonly NOISE_REGEX = /[\s-]+/g;

  private normalizedIsbn: string = '';
  private hyphenatedIsbn: string = '';
  private aggregated: AggregatedISBNMetadata | null = null;

  get data(): string {
    return JSON.stringify({
      isbn: this.normalizedIsbn,
      hyphenatedIsbn: this.hyphenatedIsbn,
      aggregated: this.aggregated
        ? {
            merged: this.aggregated.merged,
            sources: this.aggregated.sources,
          }
        : undefined,
    });
  }

  getSettingsKey(): string {
    return 'ISBNType';
  }

  quickCheck(): boolean {
    const normalized = this.normalizeInput(this.value);
    return this.isValid(normalized);
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    const normalized = this.normalizeInput(this.value);
    if (!this.isValid(normalized)) return false;

    this.normalizedIsbn = normalized;
    this.hyphenatedIsbn = hyphenate(normalized) || normalized;
    const allProviders = createDefaultIsbnProviders();
    const enabled = this.getEnabledSourceNames();
    const providers = selectIsbnProviders(allProviders, enabled);
    const aggregated = await aggregateISBNMetadata({ isbn: normalized, hyphenated: this.hyphenatedIsbn }, providers);
    if (!aggregated) return false;
    if (!this.hasUsefulISBNMetadata(aggregated.merged)) return false;

    this.aggregated = aggregated;

    return true;
  }

  async init(data?: string): Promise<void> {
    if (data !== undefined) {
      this.loadFromCache(data);
    }

    if (!this.aggregated) {
      const success = await this.hasMeaningfulInformation();
      if (!success) {
        console.info(`ISBNType: No meaningful data found for ISBN ${this.normalizedIsbn}.`);
        return;
      }
    }

    this.populateItems();
    this.populateActions();
  }

  isResolvable(): boolean {
    return this.aggregated !== null;
  }

  renderPreview(): FunctionalComponent {
    return (
      <span class={`inline-flex max-w-full min-w-0 flex-nowrap items-baseline font-mono ${this.isDarkMode ? 'text-gray-200' : ''}`}>
        <span class={'flex-none pr-2'}>📚</span>
        <span class={'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap'}>{this.aggregated?.merged.title || `ISBN ${this.normalizedIsbn || this.value}`}</span>
      </span>
    );
  }

  renderBody(): FunctionalComponent | undefined {
    const coverUrl = this.aggregated?.merged.coverUrl;
    if (!coverUrl) return undefined;

    return (
      <div class="flex w-full justify-center">
        <img
          src={coverUrl}
          alt={`Cover preview for ${this.aggregated?.merged.title || this.normalizedIsbn}`}
          class="max-h-64 rounded border border-gray-200 object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  private normalizeInput(value: string): string {
    return value.trim().replace(ISBNType.PREFIX_REGEX, '').replace(ISBNType.NOISE_REGEX, '').toUpperCase();
  }

  /**
   * Validates a normalized (separators removed) ISBN-10 or ISBN-13 using the
   * authoritative isbn3 parser. Returns true only for ISBNs whose checksum is
   * valid AND which fall within a registered group/registrant range.
   */
  private isValid(normalized: string): boolean {
    return parse(normalized) !== null;
  }

  private getEnabledSourceNames(): string[] | undefined {
    const setting = this.settings.find(entry => entry.name === 'isbnSources');
    const value = setting?.value;
    if (Array.isArray(value)) {
      const names = value.filter((name): name is string => typeof name === 'string' && name.trim().length > 0);
      if (names.length > 0) return names;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
        .split(',')
        .map(name => name.trim())
        .filter(Boolean);
    }
    return undefined;
  }

  private hasUsefulISBNMetadata(merged: AggregatedISBNMetadata['merged']): boolean {
    return Boolean(merged.title || merged.publishDate || (merged.authors && merged.authors.length > 0) || (merged.publishers && merged.publishers.length > 0));
  }

  private loadFromCache(data: string): void {
    try {
      const parsed = JSON.parse(data) as ISBNCachedData;
      this.normalizedIsbn = parsed.isbn || this.normalizeInput(this.value);
      this.hyphenatedIsbn = parsed.hyphenatedIsbn || hyphenate(this.normalizedIsbn) || this.normalizedIsbn;
      if (parsed.aggregated && parsed.aggregated.sources.length > 0) {
        this.aggregated = { merged: parsed.aggregated.merged, sources: parsed.aggregated.sources };
      }
    } catch {
      this.normalizedIsbn = this.normalizeInput(this.value);
      this.hyphenatedIsbn = hyphenate(this.normalizedIsbn) || this.normalizedIsbn;
    }
  }

  /**
   * Resolves the action label and ISBN-based URL for a source. Cache entries
   * written before action labels/URLs existed fall back to the provider
   * registry.
   */
  private resolveSourceAction(source: ISBNSourceResult): { actionLabel: string; actionUrl: string } {
    const fallback = getProviderAction(source.name, this.normalizedIsbn);
    return {
      actionLabel: source.actionLabel || fallback?.actionLabel || `View on ${source.name}`,
      actionUrl: source.actionUrl || fallback?.actionUrl || source.url || '',
    };
  }

  private populateItems(): void {
    const merged = this.aggregated?.merged;
    if (!merged) return;

    this.items.push(
      new FoldableItem(
        0,
        'ISBN',
        this.hyphenatedIsbn || this.normalizedIsbn,
        'International Standard Book Number used to identify this publication',
        'https://en.wikipedia.org/wiki/ISBN',
        undefined,
        false,
      ),
    );

    this.aggregated.sources.forEach((source, index) => {
      const { actionUrl } = this.resolveSourceAction(source);
      this.items.push(new FoldableItem(1 + index, 'Metadata Source', source.name, `Metadata fields provided by ${source.name}`, actionUrl || undefined));
    });
    let itemOrder = 1 + this.aggregated.sources.length;

    if (merged.title) this.items.push(new FoldableItem(itemOrder++, 'Title', merged.title, 'Title of the publication'));
    if (merged.subtitle) this.items.push(new FoldableItem(itemOrder++, 'Subtitle', merged.subtitle, 'Subtitle of the publication'));
    if (merged.publishDate) {
      const isoDate = toIsoDate(merged.publishDate);
      if (isoDate) {
        this.items.push(new FoldableItem(itemOrder++, 'Date', isoDate, 'Publication date'));
      }
    }
    if (merged.pages) this.items.push(new FoldableItem(itemOrder++, 'Pages', String(merged.pages), 'Number of pages'));

    (merged.authors || []).forEach(author => this.items.push(new FoldableItem(itemOrder, 'Author', formatAuthor(author))));
    if (merged.authors && merged.authors.length > 0) itemOrder++;

    if (merged.publishers && merged.publishers.length > 0) {
      this.items.push(new FoldableItem(itemOrder++, 'Publisher', merged.publishers.join(', '), 'Publisher(s) of the publication'));
    }

    if (merged.description) this.items.push(new FoldableItem(itemOrder, 'Abstract', merged.description, 'Brief description of the publication', undefined, undefined, false));
  }

  private populateActions(): void {
    if (!this.aggregated) return;

    this.aggregated.sources.forEach((source, index) => {
      const { actionLabel, actionUrl } = this.resolveSourceAction(source);
      if (actionUrl) {
        this.actions.push(new FoldableAction(index, actionLabel, actionUrl, index === 0 ? 'primary' : 'secondary'));
      }
    });
  }
}

export { DEFAULT_ISBN_SOURCE_PRIORITY };

/**
 * Normalizes a publication date into a value the date subcomponent can
 * render, or undefined when the value is not a usable date:
 * - year-only (YYYY) stays as-is (rendered as a plain string)
 * - year-month / year-month-unknown-day -> YYYY-MM-01
 * - full dates and RFC 3339 datetimes -> YYYY-MM-DD
 * - human-readable dates -> local YYYY-MM-DD (calendar date, no shift)
 * - any other value -> undefined (callers omit the Date item)
 */
function toIsoDate(publishDate: string): string | undefined {
  const value = publishDate.trim();
  if (!value) return undefined;

  if (/^\d{4}$/.test(value)) return value; // year only, rendered as text

  const monthDay = value.match(/^(\d{4})-(\d{2})/);
  if (monthDay) {
    const month = Number(monthDay[2]);
    if (month >= 1 && month <= 12) {
      // Full date present -> keep it; otherwise reduce to the first of month.
      const full = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (full) {
        const year = Number(full[1]);
        const day = Number(full[3]);
        const lastDay = new Date(year, month, 0).getDate();
        if (day >= 1 && day <= lastDay) return `${full[1]}-${full[2]}-${full[3]}`;
      }
      return `${monthDay[1]}-${monthDay[2]}-01`;
    }
    return undefined;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    // Format in local components to avoid a UTC timezone shift for
    // date-only (no time) values like "Apr 02, 2017".
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return undefined;
}
