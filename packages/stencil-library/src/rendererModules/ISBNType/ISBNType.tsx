import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';
import {
  AggregatedBookMetadata,
  BookSourceResult,
  DEFAULT_ISBN_SOURCE_PRIORITY,
  aggregateBookMetadata,
  createDefaultIsbnProviders,
  getProviderAction,
  selectIsbnProviders,
} from './bookSources';

interface ISBNCachedData {
  isbn?: string;
  aggregated?: {
    merged: AggregatedBookMetadata['merged'];
    sources: BookSourceResult[];
  };
  bookData?: AggregatedBookMetadata['merged'];
}

/**
 * Renderer for ISBN-10 and ISBN-13 identifiers.
 */
export class ISBNType extends GenericIdentifierType {
  private static readonly PREFIX_REGEX = /^ISBN(?:-1[03])?:?\s*/i;
  private static readonly NOISE_REGEX = /[\s-]+/g;
  private static readonly ISBN10_FORMAT = /^\d{9}[\dX]$/;
  private static readonly ISBN13_FORMAT = /^\d{13}$/;

  private normalizedIsbn: string = '';
  private aggregated: AggregatedBookMetadata | null = null;

  get data(): string {
    return JSON.stringify({
      isbn: this.normalizedIsbn,
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
    const allProviders = createDefaultIsbnProviders();
    const enabled = this.getEnabledSourceNames();
    const providers = selectIsbnProviders(allProviders, enabled);
    const aggregated = await aggregateBookMetadata({ isbn: normalized, hyphenated: this.extractHyphenatedForm(normalized) }, providers);
    if (!aggregated) return false;
    if (!this.hasUsefulBookMetadata(aggregated.merged)) return false;

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
   * Extracts the hyphenated form of the identifier from the raw input value,
   * e.g. "978-0-262-03384-8" from "ISBN 978-0-262-03384-8". Returns undefined
   * if the raw value contains no hyphens or does not match the normalized ISBN.
   */
  private extractHyphenatedForm(normalized: string): string | undefined {
    const raw = this.value.trim().replace(ISBNType.PREFIX_REGEX, '').replace(/\s+/g, '').toUpperCase();
    if (!raw.includes('-')) return undefined;
    if (raw.replace(ISBNType.NOISE_REGEX, '') !== normalized) return undefined;
    return raw;
  }

  private isValid(normalized: string): boolean {
    if (ISBNType.ISBN10_FORMAT.test(normalized)) return this.isValidIsbn10(normalized);
    if (ISBNType.ISBN13_FORMAT.test(normalized)) return this.isValidIsbn13(normalized);
    return false;
  }

  private isValidIsbn10(isbn: string): boolean {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      const char = isbn[i];
      const digit = i === 9 && char === 'X' ? 10 : Number(char);
      if (!Number.isInteger(digit)) return false;
      sum += (10 - i) * digit;
    }
    return sum % 11 === 0;
  }

  private isValidIsbn13(isbn: string): boolean {
    if (!isbn.startsWith('978') && !isbn.startsWith('979')) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = Number(isbn[i]);
      if (!Number.isInteger(digit)) return false;
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return checksum === Number(isbn[12]);
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

  private hasUsefulBookMetadata(merged: AggregatedBookMetadata['merged']): boolean {
    return Boolean(merged.title || merged.publishDate || (merged.authors && merged.authors.length > 0) || (merged.publishers && merged.publishers.length > 0));
  }

  private loadFromCache(data: string): void {
    try {
      const parsed = JSON.parse(data) as ISBNCachedData;
      this.normalizedIsbn = parsed.isbn || this.normalizeInput(this.value);
      if (parsed.aggregated && parsed.aggregated.sources.length > 0) {
        this.aggregated = { merged: parsed.aggregated.merged, sources: parsed.aggregated.sources };
      } else if (parsed.bookData) {
        const source: BookSourceResult = {
          name: 'OpenLibrary',
          actionLabel: '',
          actionUrl: '',
          url: parsed.bookData.sourceUrl,
          metadata: parsed.bookData,
        };
        const action = this.resolveSourceAction(source);
        this.aggregated = { merged: parsed.bookData, sources: [{ ...source, ...action }] };
      }
    } catch {
      this.normalizedIsbn = this.normalizeInput(this.value);
    }
  }

  /**
   * Resolves the action label and ISBN-based URL for a source. Cache entries
   * written before action labels/URLs existed fall back to the provider
   * registry.
   */
  private resolveSourceAction(source: BookSourceResult): { actionLabel: string; actionUrl: string } {
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
        this.normalizedIsbn,
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
      const parsedDate = new Date(merged.publishDate);
      const displayDate = Number.isNaN(parsedDate.getTime()) ? merged.publishDate : parsedDate.toDateString();
      this.items.push(new FoldableItem(itemOrder++, 'Date', displayDate, 'Publication date'));
    }
    if (merged.pages) this.items.push(new FoldableItem(itemOrder++, 'Pages', String(merged.pages), 'Number of pages'));

    (merged.authors || []).forEach(name => this.items.push(new FoldableItem(itemOrder, 'Author', name)));
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
