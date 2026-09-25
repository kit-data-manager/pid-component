import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DOIType, dataCiteProvider, crossRefProvider, DOIProviderInfo } from '../DOIType';
import { DataCiteDOIType } from '../DataCite/DataCiteDOIType';
import { CrossRefDOIType } from '../CrossRef/CrossRefDOIType';
import * as DataCache from '../../../utils/DataCache';
import { DOI_examples } from '../../../../../../examples';
import dataCiteFixture from '../../../../../../examples/fixtures/doi-datacite.json';
import workFixture from '../../../../../../examples/fixtures/doi-crossref.json';

const dataCiteFixtureTyped = dataCiteFixture as Record<string, unknown>;

describe('DOIType provider descriptors', () => {
  it('exposes distinct provider ids used as settings keys', () => {
    expect(dataCiteProvider.id).toBe('DataCiteDOIType');
    expect(crossRefProvider.id).toBe('CrossRefDOIType');
  });

  it('derives the provider name', () => {
    expect(dataCiteProvider.name).toBe('DataCite');
    expect(crossRefProvider.name).toBe('CrossRef');
  });

  it('flags CrossRef funders but not works', () => {
    const funder = { title: 'Funder', type: 'funder' } as DOIProviderInfo;
    const work = { title: 'Work', type: 'work' } as DOIProviderInfo;
    expect(crossRefProvider.isFunder?.(funder)).toBe(true);
    expect(crossRefProvider.isFunder?.(work)).toBe(false);
  });

  it('does not treat DataCite info as a funder', () => {
    const info = { title: 'Dataset' } as DOIProviderInfo;
    expect(dataCiteProvider.isFunder?.(info)).toBeUndefined();
  });
});

describe('DOIType subclass behavior preservation', () => {
  let dataciteFetchSpy: ReturnType<typeof vi.spyOn>;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    dataciteFetchSpy = vi.spyOn(DataCache, 'cachedFetch');
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    dataciteFetchSpy.mockRestore();
    globalThis.fetch = originalFetch;
  });

  describe('DataCiteDOIType', () => {
    it('returns the DataCite settings key', () => {
      const type = new DataCiteDOIType(DOI_examples.DATACITE_SLIDES);
      expect(type.getSettingsKey()).toBe('DataCiteDOIType');
    });

    it('quickCheck matches only DOI values', () => {
      expect(new DataCiteDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER).quickCheck()).toBe(true);
      expect(new DataCiteDOIType(DOI_examples.INVALID_NOT_A_DOI).quickCheck()).toBe(false);
      expect(new DataCiteDOIType('').quickCheck()).toBe(false);
    });

    it('builds DataCite metadata source and metadata action', async () => {
      dataciteFetchSpy.mockResolvedValue(dataCiteFixtureTyped);
      const type = new DataCiteDOIType(DOI_examples.DATACITE_SLIDES);
      await type.init();

      const source = type.items.find(i => i.keyTitle === 'Metadata Source');
      expect(source?.value).toBe('DataCite');
      expect(source?.keyLink).toBe('https://datacite.org');

      const metadataAction = type.actions.find(a => a.title === 'View DataCite Metadata');
      expect(metadataAction).toBeDefined();
      expect(metadataAction?.link).toBe(
        `https://api.datacite.org/dois/${encodeURIComponent(DOI_examples.DATACITE_SLIDES)}`,
      );
    });

    it('exposes providerName', () => {
      expect(new DataCiteDOIType(DOI_examples.DATACITE_SLIDES).providerName).toBe('DataCite');
    });
  });

  describe('CrossRefDOIType', () => {
    it('returns the CrossRef settings key', () => {
      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      expect(type.getSettingsKey()).toBe('CrossRefDOIType');
    });

    it('builds CrossRef metadata source and metadata action for works', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      }) as unknown as typeof fetch;

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const source = type.items.find(i => i.keyTitle === 'Metadata Source');
      expect(source?.value).toBe('CrossRef');
      expect(source?.keyLink).toBe('https://www.crossref.org');

      const metadataAction = type.actions.find(a => a.title === 'View CrossRef Metadata');
      expect(metadataAction).toBeDefined();
      expect(metadataAction?.link).toBe(
        `https://api.crossref.org/works/${DOI_examples.CROSSREF_JOURNAL_PAPER}`,
      );
    });

    it('builds CrossRef funder metadata source and funder action when info type is funder', async () => {
      const funderFixture = {
        status: 'ok',
        'message-type': 'funder',
        message: {
          name: 'Deutsche Forschungsgemeinschaft',
          id: '501100001659',
          url: 'https://www.dfg.de',
        },
      };
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/funders/')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(funderFixture),
          });
        }
        // works endpoint returns non-ok so CrossRefInfo falls through to funders
        return Promise.resolve({ ok: false });
      }) as unknown as typeof fetch;

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_FUNDING);
      await type.init();

      const source = type.items.find(i => i.keyTitle === 'Metadata Source');
      expect(source?.value).toBe('CrossRef (Funder)');

      const metadataAction = type.actions.find(a => a.title === 'View CrossRef Metadata');
      expect(metadataAction).toBeDefined();
      expect(metadataAction?.link).toBe(`https://api.crossref.org/funders/10.13039/501100001659`);
    });

    it('exposes providerName', () => {
      expect(new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER).providerName).toBe(
        'CrossRef',
      );
    });
  });
});
