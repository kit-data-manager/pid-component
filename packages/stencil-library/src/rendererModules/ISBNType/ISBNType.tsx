import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';

interface OpenLibraryPerson {
  name?: string;
}

interface OpenLibraryTextObject {
  value?: string;
}

interface OpenLibraryExcerpt {
  text?: string;
}

interface OpenLibraryBookData {
  title?: string;
  subtitle?: string;
  authors?: OpenLibraryPerson[];
  publish_date?: string;
  publishers?: OpenLibraryPerson[];
  number_of_pages?: number;
  identifiers?: Record<string, string[]>;
  url?: string;
  info_url?: string;
  preview_url?: string;
  thumbnail_url?: string;
  cover?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  notes?: string | OpenLibraryTextObject;
  description?: string | OpenLibraryTextObject;
  excerpts?: OpenLibraryExcerpt[];
}

interface ISBNCachedData {
  isbn?: string;
  bookData?: OpenLibraryBookData;
}

/**
 * Response shape of the Open Library ISBN endpoint
 * (https://openlibrary.org/isbn/{isbn}.json).
 */
interface OpenLibraryEdition {
  title?: string;
  subtitle?: string;
  publish_date?: string;
  publishers?: string[];
  number_of_pages?: number;
  covers?: number[];
  authors?: { key?: string }[];
  works?: { key?: string }[];
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
  private bookData: OpenLibraryBookData | null = null;

  get data(): string {
    return JSON.stringify({
      isbn: this.normalizedIsbn,
      bookData: this.bookData ?? {},
    });
  }

  getSettingsKey(): string {
    return 'ISBNType';
  }

  quickCheck(): boolean {
    const normalized = this.normalizeInput(this.value);
    if (ISBNType.ISBN10_FORMAT.test(normalized)) return this.isValidIsbn10(normalized);
    if (ISBNType.ISBN13_FORMAT.test(normalized)) return this.isValidIsbn13(normalized);
    return false;
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    const normalized = this.normalizeInput(this.value);
    if (!this.isValid(normalized)) return false;

    this.normalizedIsbn = normalized;
    // The legacy Books API (openlibrary.org/api/books) has been discontinued.
    // The ISBN endpoint redirects to the matching edition document.
    const apiUrl = `https://openlibrary.org/isbn/${encodeURIComponent(normalized)}.json`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) return false;
      const edition = (await response.json()) as OpenLibraryEdition;
      const book = await this.mapEditionToBookData(edition, normalized);
      if (!this.hasUsefulBookMetadata(book)) return false;

      this.bookData = book;

      return true;
    } catch {
      return false;
    }
  }

  private async mapEditionToBookData(edition: OpenLibraryEdition, isbn: string): Promise<OpenLibraryBookData> {
    const book: OpenLibraryBookData = {
      title: edition.title,
      subtitle: edition.subtitle,
      publish_date: edition.publish_date,
      number_of_pages: edition.number_of_pages,
      url: `https://openlibrary.org/isbn/${isbn}`,
      authors: [],
      publishers: (edition.publishers || []).map(name => ({ name })),
    };

    if (edition.covers && edition.covers.length > 0) {
      book.cover = { medium: `https://covers.openlibrary.org/b/id/${edition.covers[0]}-M.jpg` };
    }

    const authorNames = await Promise.all(
      (edition.authors || [])
        .map(author => author.key)
        .map(async key => {
          try {
            const response = await fetch(`https://openlibrary.org${key}.json`);
            if (!response.ok) return null;
            const author = (await response.json()) as { name?: string };
            return author.name || null;
          } catch {
            return null;
          }
        }),
    );
    book.authors = authorNames.filter((name): name is string => Boolean(name)).map(name => ({ name }));

    const workKey = (edition.works || []).find(work => work.key)?.key;
    if (workKey) {
      try {
        const response = await fetch(`https://openlibrary.org${workKey}.json`);
        if (response.ok) {
          const work = (await response.json()) as { description?: string | OpenLibraryTextObject };
          if (work.description) book.description = work.description;
        }
      } catch {
        // Description is optional, ignore failures.
      }
    }

    return book;
  }

  async init(data?: string): Promise<void> {
    if (data !== undefined) {
      this.loadFromCache(data);
    }

    if (!this.bookData) {
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
    return this.bookData !== null;
  }

  renderPreview(): FunctionalComponent {
    return (
      <span class={`inline-flex max-w-full min-w-0 flex-nowrap items-baseline font-mono ${this.isDarkMode ? 'text-gray-200' : ''}`}>
        <span class={'flex-none pr-2'}>📚</span>
        <span class={'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap'}>{this.bookData?.title || `ISBN ${this.normalizedIsbn || this.value}`}</span>
      </span>
    );
  }

  renderBody(): FunctionalComponent | undefined {
    const coverUrl = this.bookData?.cover?.medium || this.bookData?.cover?.small || this.bookData?.thumbnail_url;
    if (!coverUrl) return undefined;

    return (
      <div class="flex w-full justify-center">
        <img
          src={coverUrl}
          alt={`Cover preview for ${this.bookData?.title || this.normalizedIsbn}`}
          class="max-h-64 rounded border border-gray-200 object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  private normalizeInput(value: string): string {
    return value.trim().replace(ISBNType.PREFIX_REGEX, '').replace(ISBNType.NOISE_REGEX, '').toUpperCase();
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

  private hasUsefulBookMetadata(book: OpenLibraryBookData): boolean {
    return Boolean(book.title || book.publish_date || (book.authors && book.authors.length > 0) || (book.publishers && book.publishers.length > 0));
  }

  private loadFromCache(data: string): void {
    try {
      const parsed = JSON.parse(data) as ISBNCachedData;
      this.normalizedIsbn = parsed.isbn || this.normalizeInput(this.value);
      this.bookData = parsed.bookData || null;
    } catch {
      this.normalizedIsbn = this.normalizeInput(this.value);
    }
  }

  private populateItems(): void {
    if (!this.bookData) return;

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
    this.items.push(new FoldableItem(1, 'Metadata Source', 'OpenLibrary', 'Metadata provided by OpenLibrary', 'https://openlibrary.org/developers/api'));

    if (this.bookData.title) this.items.push(new FoldableItem(2, 'Title', this.bookData.title, 'Title of the publication'));
    if (this.bookData.subtitle) this.items.push(new FoldableItem(3, 'Subtitle', this.bookData.subtitle, 'Subtitle of the publication'));
    if (this.bookData.publish_date) this.items.push(new FoldableItem(4, 'Date', new Date(this.bookData.publish_date).toDateString(), 'Publication date'));
    if (this.bookData.number_of_pages) this.items.push(new FoldableItem(5, 'Pages', String(this.bookData.number_of_pages), 'Number of pages'));

    (this.bookData.authors || [])
      .map(author => author.name)
      .filter((name): name is string => Boolean(name))
      .map(name => new FoldableItem(6, 'Author', name))
      .forEach(item => this.items.push(item));

    const publisherNames = (this.bookData.publishers || []).map(publisher => publisher.name).filter((name): name is string => Boolean(name));
    if (publisherNames.length > 0) this.items.push(new FoldableItem(7, 'Publisher', publisherNames.join(', '), 'Publisher(s) of the publication'));

    const summary = this.extractSummary();
    if (summary) this.items.push(new FoldableItem(8, 'Abstract', summary, 'Brief description of the publication', undefined, undefined, false));
  }

  private populateActions(): void {
    if (!this.bookData) return;

    const openLibraryUrl = this.bookData.url ? this.bookData.url : `https://openlibrary.org/isbn/${this.normalizedIsbn}`;
    this.actions.push(new FoldableAction(0, 'View on OpenLibrary', openLibraryUrl, 'primary'));

    if (this.bookData.preview_url) {
      this.actions.push(new FoldableAction(2, 'Open Preview', this.bookData.preview_url, 'secondary'));
    }
  }

  private extractSummary(): string | null {
    if (!this.bookData) return null;

    const fromDescription = this.extractText(this.bookData.description);
    if (fromDescription) return fromDescription;

    const fromNotes = this.extractText(this.bookData.notes);
    if (fromNotes) return fromNotes;

    const excerpt = this.bookData.excerpts?.find(item => item.text)?.text;
    return excerpt || null;
  }

  private extractText(value: string | OpenLibraryTextObject | undefined): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return value.value || null;
  }
}
