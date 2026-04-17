// Polyfill `self` before any module imports (DataCache uses `self.caches`)
(globalThis as any).self = globalThis;

import { ORCIDType } from '../../../rendererModules/ORCiD/ORCIDType';
import * as DataCache from '../../../utils/DataCache';

let cachedFetchSpy: jest.SpyInstance;
beforeEach(() => {
  cachedFetchSpy = jest.spyOn(DataCache, 'cachedFetch');
});
afterEach(() => {
  cachedFetchSpy.mockRestore();
});

describe('ORCIDType', () => {
  describe('hasCorrectFormatQuick()', () => {
    it('returns true for a bare ORCiD', () => {
      const ot = new ORCIDType('0009-0005-2800-4833');
      expect(ot.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for ORCiD with prefix URL', () => {
      const ot = new ORCIDType('https://orcid.org/0009-0005-2800-4833');
      expect(ot.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns false for non-ORCiD string', () => {
      const ot = new ORCIDType('not-an-orcid');
      expect(ot.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for empty string', () => {
      const ot = new ORCIDType('');
      expect(ot.hasCorrectFormatQuick()).toBe(false);
    });
  });

  describe('hasCorrectFormat()', () => {
    it('matches hasCorrectFormatQuick() result', async () => {
      const ot = new ORCIDType('0009-0005-2800-4833');
      expect(await ot.hasCorrectFormat()).toBe(ot.hasCorrectFormatQuick());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "ORCIDType"', () => {
      const ot = new ORCIDType('0009-0005-2800-4833');
      expect(ot.getSettingsKey()).toBe('ORCIDType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const ot = new ORCIDType('0009-0005-2800-4833');
      expect(ot.value).toBe('0009-0005-2800-4833');
    });
  });

  describe('init()', () => {
    const orcidApiResponse = {
      person: {
        name: { 'given-names': { value: 'Maximilian' }, 'family-name': { value: 'Inckmann' } },
        biography: { content: 'Researcher at KIT' },
        emails: { email: [{ email: 'maximilian.inckmann@kit.edu', primary: true, verified: true }] },
        keywords: { keyword: [{ content: 'FAIR', 'display-index': 0 }] },
        'researcher-urls': { 'researcher-url': [] },
        addresses: { address: [{ country: { value: 'DE' } }] },
      },
      preferences: { locale: 'en' },
      'activities-summary': {
        employments: {
          'affiliation-group': [
            {
              summaries: [{
                'employment-summary': {
                  organization: { name: 'KIT' },
                  'start-date': { year: { value: '2022' }, month: { value: '01' }, day: { value: '01' } },
                  'end-date': null,
                  'department-name': 'CS',
                },
              }],
            },
          ],
        },
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('fetches ORCIDInfo from API and populates items', async () => {
      cachedFetchSpy.mockResolvedValue(orcidApiResponse);

      const ot = new ORCIDType('0009-0005-2800-4833');
      await ot.init();

      expect(ot.items.length).toBeGreaterThanOrEqual(1);
      expect(ot.items[0].keyTitle).toBe('ORCiD');
      expect(ot.actions.length).toBeGreaterThanOrEqual(1);
      expect(ot.actions[0].title).toBe('Open ORCiD profile');
    });

    it('adds primary email item and mailto action', async () => {
      cachedFetchSpy.mockResolvedValue(orcidApiResponse);

      const ot = new ORCIDType('0009-0005-2800-4833');
      await ot.init();

      const emailItem = ot.items.find(i => i.keyTitle === 'Primary E-Mail address');
      expect(emailItem).toBeDefined();
      expect(emailItem.value).toBe('maximilian.inckmann@kit.edu');

      const emailAction = ot.actions.find(a => a.title === 'Send E-Mail');
      expect(emailAction).toBeDefined();
    });
  });

  describe('isResolvable()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns true when ORCiDJSON is defined (successful API response)', async () => {
      cachedFetchSpy.mockResolvedValue({
        person: {
          name: { 'given-names': { value: 'Max' }, 'family-name': { value: 'Doe' } },
          biography: null,
          emails: { email: [] },
          keywords: { keyword: [] },
          'researcher-urls': { 'researcher-url': [] },
          addresses: { address: [] },
        },
        preferences: { locale: null },
        'activities-summary': { employments: { 'affiliation-group': [] } },
      });

      const ot = new ORCIDType('0009-0005-2800-4833');
      await ot.init();

      expect(ot.isResolvable()).toBe(true);
    });
  });
});
