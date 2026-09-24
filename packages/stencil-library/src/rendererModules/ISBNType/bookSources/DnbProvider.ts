import { BookMetadata, BookSourceProvider, IsbnLookup, decodeXmlEntities, fetchWithTimeout, hasAnyField } from './BookMetadata';

export class DnbProvider implements BookSourceProvider {
  readonly name = 'DNB';

  async fetch(lookup: IsbnLookup): Promise<Partial<BookMetadata> | null> {
    // DNB normalizes hyphens itself, any ISBN spelling works.
    const url = `https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=${encodeURIComponent(`isbn=${lookup.isbn}`)}&recordSchema=oai_dc&maximumRecords=1`;
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) return null;
      const xml = await response.text();
      const metadata = parseDnbOaiDc(xml);
      return hasAnyField(metadata) ? metadata : null;
    } catch {
      return null;
    }
  }
}

export function parseDnbOaiDc(xml: string): Partial<BookMetadata> {
  const extract = (tag: string): string[] => {
    const matches = xml.matchAll(new RegExp(`<dc:${tag}[^>]*>([\\s\\S]*?)</dc:${tag}>`, 'g'));
    return Array.from(matches, match => decodeXmlEntities(match[1].trim())).filter(Boolean);
  };

  const idn = xml.match(/xsi:type="dnb:IDN"[^>]*>([^<]+)</)?.[1];
  const metadata: Partial<BookMetadata> = {
    sourceUrl: idn ? `https://d-nb.info/${idn.trim()}` : undefined,
  };

  const [title] = extract('title');
  if (title) metadata.title = title;

  const creators = extract('creator');
  if (creators.length > 0) metadata.authors = creators;

  const publishers = extract('publisher');
  if (publishers.length > 0) metadata.publishers = publishers;

  const [date] = extract('date');
  if (date) metadata.publishDate = date;

  const subjects = extract('subject');
  if (subjects.length > 0) metadata.subjects = subjects;

  const [format] = extract('format');
  const pages = format?.match(/(\d+)\s*[SpP]\b/)?.[1];
  if (pages) metadata.pages = Number(pages);

  return metadata;
}
