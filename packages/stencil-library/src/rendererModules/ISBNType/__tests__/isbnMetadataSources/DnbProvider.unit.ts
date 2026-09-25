import { describe, expect, it } from 'vitest';
import { DnbProvider, normalizeDnbCreator, parseDnbOaiDc } from '../../isbnMetadataSources/DnbProvider';
import { DNB_EMPTY_XML, DNB_XML, installDnbSuccess, installFetchMock, useFailingFetchInTests } from './isbnMetadataSourcesTestUtils';

describe('normalizeDnbCreator', () => {
  it('strips a bracketed role marker', () => {
    expect(normalizeDnbCreator('Knuth, Donald [Verfasser]')).toBe('Knuth, Donald');
  });

  it('strips a stray trailing role marker without opening bracket', () => {
    expect(normalizeDnbCreator('Ritchie, Dennis Verfasser]')).toBe('Ritchie, Dennis');
  });

  it('strips an unbalanced opening bracket', () => {
    expect(normalizeDnbCreator('[Kernighan, Brian W. [Verfasser]')).toBe('Kernighan, Brian W.');
  });

  it('collapses repeated whitespace', () => {
    expect(normalizeDnbCreator('Knuth,  Donald ')).toBe('Knuth, Donald');
  });
});

describe('DnbProvider', () => {
  useFailingFetchInTests();

  it('has name and action metadata', () => {
    const provider = new DnbProvider();
    expect(provider.name).toBe('DNB');
    expect(provider.actionLabel).toBe('View in DNB catalog');
    expect(provider.isbnUrl('9783453416017')).toBe('https://portal.dnb.de/opac.htm?query=isbn:9783453416017');
  });

  it('parses the first oai_dc record', async () => {
    installDnbSuccess();
    const metadata = await new DnbProvider().fetch({ isbn: '9783453416017' });

    expect(metadata).toEqual({
      title: 'Homöopathische Hausapotheke : alternative Heilmethoden',
      authors: [
        { givenName: 'Maesimund B.', familyName: 'Panos', fullName: 'Panos, Maesimund B.' },
        { givenName: 'Jane', familyName: 'Heimlich', fullName: 'Heimlich, Jane' },
      ],
      publishers: ['München : Heyne'],
      publishDate: '1995',
      subjects: ['33 Medizin'],
      pages: 318,
      sourceUrl: 'https://d-nb.info/944033466',
    });
  });

  it('queries the SRU endpoint with the ISBN', async () => {
    const mock = installFetchMock(() => ({ ok: true, text: DNB_XML }));

    await new DnbProvider().fetch({ isbn: '9783453416017' });

    expect(String(mock.mock.calls[0][0])).toBe(
      'https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=isbn%3D9783453416017&recordSchema=oai_dc&maximumRecords=1',
    );
  });

  it('returns null when there are no records', async () => {
    installFetchMock(() => ({ ok: true, text: DNB_EMPTY_XML }));

    const metadata = await new DnbProvider().fetch({ isbn: '9783453416017' });

    expect(metadata).toBeNull();
  });

  it('returns null when the request fails', async () => {
    const metadata = await new DnbProvider().fetch({ isbn: '9783453416017' });

    expect(metadata).toBeNull();
  });

  it('returns null when the request rejects', async () => {
    installFetchMock(() => ({ reject: true }));

    const metadata = await new DnbProvider().fetch({ isbn: '9783453416017' });

    expect(metadata).toBeNull();
  });
});

describe('parseDnbOaiDc', () => {
  it('returns an empty object for XML without any dc fields', () => {
    expect(parseDnbOaiDc(DNB_EMPTY_XML)).toEqual({});
  });

  it('omits optional fields when absent', () => {
    const xml = `<recordData>
      <dc xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>Only A Title</dc:title>
      </dc>
    </recordData>`;

    expect(parseDnbOaiDc(xml)).toEqual({ title: 'Only A Title' });
  });

  it('ignores page counts without a page unit in dc:format', () => {
    const xml = `<recordData>
      <dc xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>Paperback</dc:title>
        <dc:format>8°</dc:format>
      </dc>
    </recordData>`;

    expect(parseDnbOaiDc(xml)).toEqual({ title: 'Paperback' });
  });

  it('matches page counts with capital or plural units', () => {
    const xml = `<recordData>
      <dc xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>Pages</dc:title>
        <dc:format>123 S., 45 Beil.</dc:format>
      </dc>
    </recordData>`;

    expect(parseDnbOaiDc(xml)).toEqual({ title: 'Pages', pages: 123 });
  });

  it('decodes XML entities in field values', () => {
    const xml = `<recordData>
      <dc xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>A &amp; B &lt;C&gt; &quot;D&quot; &apos;E&apos;</dc:title>
      </dc>
    </recordData>`;

    expect(parseDnbOaiDc(xml)).toEqual({ title: 'A & B <C> "D" \'E\'' });
  });
});
