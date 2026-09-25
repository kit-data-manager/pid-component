import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CrossRefDOIType } from '../../CrossRef/CrossRefDOIType';
import { DOI } from '../../DOI';
import { DOI_examples } from '../../../../../../../examples';
import workFixture from '../../../../../../../examples/fixtures/doi-crossref.json';

const funderFixture = {
  status: 'ok',
  'message-type': 'funder',
  message: {
    name: 'Deutsche Forschungsgemeinschaft',
    location: 'Germany',
    established: 1951,
    'alternate-name': ['DFG', 'German Research Foundation'],
    url: 'https://www.dfg.de',
    id: '501100001659',
    'hierarchy-names': {
      '501100001659': 'Deutsche Forschungsgemeinschaft',
    },
    hierarchy: {
      '501100001659': {},
    },
    descendants: [
      { name: 'DFG Projekt', id: 'abc123' },
    ],
  },
};

let originalFetch: typeof global.fetch;

describe('CrossRefDOIType', () => {
  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('quickCheck()', () => {
    it('returns true for valid DOI value', () => {
      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      expect(type.quickCheck()).toBe(true);
    });

    it('returns false for invalid DOI value', () => {
      const type = new CrossRefDOIType('not-a-doi');
      expect(type.quickCheck()).toBe(false);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('returns true when fetch returns valid work info', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      const result = await type.hasMeaningfulInformation();

      expect(result).toBe(true);
    });

    it('returns true when fetch returns valid funder info', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/funders/')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(funderFixture),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      const result = await type.hasMeaningfulInformation();

      expect(result).toBe(true);
    });

    it('returns false when fetch returns null', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ status: 'ok' }),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      const result = await type.hasMeaningfulInformation();

      expect(result).toBe(false);
    });

    it('returns false when work has empty title', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          status: 'ok',
          message: { DOI: DOI_examples.CROSSREF_JOURNAL_PAPER, title: [] },
        }),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      const result = await type.hasMeaningfulInformation();

      expect(result).toBe(false);
    });

    it('returns false when network error occurs', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      const result = await type.hasMeaningfulInformation();

      expect(result).toBe(false);
    });
  });

  describe('init()', () => {
    it('initializes with fetched work data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      expect(type.items.length).toBeGreaterThan(0);
      expect(type.actions.length).toBeGreaterThan(0);

      const doiItem = type.items.find(i => i.keyTitle === 'DOI');
      expect(doiItem).toBeDefined();
      expect(doiItem?.value).toBe(DOI_examples.CROSSREF_JOURNAL_PAPER);

      const metadataSource = type.items.find(i => i.keyTitle === 'Metadata Source');
      expect(metadataSource).toBeDefined();
      expect(metadataSource?.value).toBe('CrossRef');
    });

    it('initializes with fetched funder data', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/funders/')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(funderFixture),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const metadataSource = type.items.find(i => i.keyTitle === 'Metadata Source');
      expect(metadataSource?.value).toBe('CrossRef');
    });

    it('returns early when info is null', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockRejectedValue(new Error('Not found')),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      expect(type.items.length).toBe(0);
      expect(type.actions.length).toBe(0);
    });

    it('creates Open Resource action when url exists', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const openResourceAction = type.actions.find(a => a.title === 'Open Resource');
      expect(openResourceAction).toBeDefined();
      expect(openResourceAction?.link).toBe(`https://doi.org/${DOI_examples.CROSSREF_JOURNAL_PAPER}`);
      expect(openResourceAction?.style).toBe('primary');
    });

    it('falls back to DOI URL when resource url is missing', async () => {
      const noUrlFixture = {
        status: 'ok',
        'message-type': 'work',
        message: {
          DOI: DOI_examples.CROSSREF_JOURNAL_PAPER,
          title: ['Test'],
        },
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(noUrlFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const openResourceAction = type.actions.find(a => a.title === 'Open Resource');
      expect(openResourceAction).toBeDefined();
      expect(openResourceAction?.link).toBe(`https://doi.org/${DOI_examples.CROSSREF_JOURNAL_PAPER}`);
    });

    it('creates View CrossRef Metadata action for work', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const viewMetadataAction = type.actions.find(a => a.title === 'View CrossRef Metadata');
      expect(viewMetadataAction).toBeDefined();
      expect(viewMetadataAction?.link).toContain(`https://api.crossref.org/works/${DOI_examples.CROSSREF_JOURNAL_PAPER}`);
    });

    it('creates View CrossRef Metadata action for funder', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/funders/')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(funderFixture),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const viewMetadataAction = type.actions.find(a => a.title === 'View CrossRef Metadata');
      expect(viewMetadataAction).toBeDefined();
      expect(viewMetadataAction?.link).toContain(`https://api.crossref.org/funders/${DOI_examples.CROSSREF_JOURNAL_PAPER}`);
    });

    it('creates Resolve DOI action', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const resolveDOIAction = type.actions.find(a => a.title === 'Resolve DOI');
      expect(resolveDOIAction).toBeDefined();
      expect(resolveDOIAction?.link).toBe(`https://doi.org/${DOI_examples.CROSSREF_JOURNAL_PAPER}`);
      expect(resolveDOIAction?.style).toBe('secondary');
    });

    it('initializes from serialized data', async () => {
      const info = {
        doi: JSON.stringify({ doi: DOI_examples.CROSSREF_JOURNAL_PAPER }),
        rawMetadata: workFixture,
        type: 'work',
      };

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.hasMeaningfulInformation();
      await type.init(JSON.stringify(info));

      expect(type.items.length).toBeGreaterThan(0);
    });
  });

  describe('isResolvable()', () => {
    it('returns true when info exists with title', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.hasMeaningfulInformation();

      expect(type.isResolvable()).toBe(true);
    });

    it('returns false when info is null', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockRejectedValue(new Error('Not found')),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.hasMeaningfulInformation();

      expect(type.isResolvable()).toBe(false);
    });

    it('returns false when title is empty', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          status: 'ok',
          message: { DOI: DOI_examples.CROSSREF_JOURNAL_PAPER, title: [] },
        }),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.hasMeaningfulInformation();

      expect(type.isResolvable()).toBe(false);
    });
  });

  describe('renderPreview()', () => {
    it('renders preview with creators and year', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const preview = type.renderPreview();
      expect(preview).toBeDefined();
    });

    it('renders preview for funder type', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/funders/')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(funderFixture),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const preview = type.renderPreview();
      expect(preview).toBeDefined();
    });

    it('renders preview with dark mode setting', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER, [
        { name: 'darkMode', value: 'dark' },
      ]);
      await type.init();

      const preview = type.renderPreview();
      expect(preview).toBeDefined();
    });

    it('renders preview with light mode setting', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER, [
        { name: 'darkMode', value: 'light' },
      ]);
      await type.init();

      const preview = type.renderPreview();
      expect(preview).toBeDefined();
    });

    it('renders preview without creators', async () => {
      const noCreatorsFixture = {
        status: 'ok',
        'message-type': 'work',
        message: {
          DOI: DOI_examples.CROSSREF_JOURNAL_PAPER,
          title: ['Test Title'],
          published: { 'date-parts': [[2025]] },
        },
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(noCreatorsFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const preview = type.renderPreview();
      expect(preview).toBeDefined();
    });
  });

  describe('getSettingsKey()', () => {
    it('returns CrossRefDOIType', () => {
      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      expect(type.getSettingsKey()).toBe('CrossRefDOIType');
    });
  });

  describe('data getter', () => {
    it('returns JSON string of info', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(workFixture),
      });

      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      await type.init();

      const data = type.data;
      expect(typeof data).toBe('string');
      const parsed = JSON.parse(data as string);
      expect(parsed).toBeDefined();
    });

    it('returns empty object JSON when info is null', () => {
      const type = new CrossRefDOIType(DOI_examples.CROSSREF_JOURNAL_PAPER);
      const data = type.data;
      expect(data).toBe('{}');
    });
  });
});
