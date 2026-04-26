// Polyfill `self` before any module imports (DataCache uses `self.caches`)
(globalThis as any).self = globalThis;

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ORCIDType } from '../../../rendererModules/ORCiD/ORCIDType';
import * as DataCache from '../../../utils/DataCache';
import { ORCID_examples } from '../../../../../../examples/orcid/values.ts';

let cachedFetchSpy: any;
beforeEach(() => {
  cachedFetchSpy = vi.spyOn(DataCache, 'cachedFetch');
});
afterEach(() => {
  cachedFetchSpy.mockRestore();
});

describe('ORCIDType', () => {
  describe('hasCorrectFormatQuick()', () => {
    it('returns true for a bare ORCiD', () => {
      const ot = new ORCIDType(ORCID_examples.VALID);
      expect(ot.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for ORCiD with prefix URL', () => {
      const ot = new ORCIDType(ORCID_examples.VALID_WITH_HTTPS);
      expect(ot.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns false for non-ORCiD string', () => {
      const ot = new ORCIDType(ORCID_examples.INVALID_NOT_AN_ORCID);
      expect(ot.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for empty string', () => {
      const ot = new ORCIDType(ORCID_examples.INVALID_EMPTY);
      expect(ot.hasCorrectFormatQuick()).toBe(false);
    });
  });

  describe('hasCorrectFormat()', () => {
    it('matches hasCorrectFormatQuick() result', async () => {
      const ot = new ORCIDType(ORCID_examples.VALID);
      expect(await ot.hasCorrectFormat()).toBe(ot.hasCorrectFormatQuick());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "ORCIDType"', () => {
      const ot = new ORCIDType(ORCID_examples.VALID);
      expect(ot.getSettingsKey()).toBe('ORCIDType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const ot = new ORCIDType(ORCID_examples.VALID);
      expect(ot.value).toBe(ORCID_examples.VALID);
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
      vi.clearAllMocks();
    });

    it('fetches ORCIDInfo from API and populates items', async () => {
      cachedFetchSpy.mockResolvedValue(orcidApiResponse);

      const ot = new ORCIDType(ORCID_examples.VALID);
      await ot.init();

      expect(ot.items.length).toBeGreaterThanOrEqual(1);
      expect(ot.items[0].keyTitle).toBe('ORCiD');
      expect(ot.actions.length).toBeGreaterThanOrEqual(1);
      expect(ot.actions[0].title).toBe('Open ORCiD profile');
    });

    it('adds primary email item and mailto action', async () => {
      cachedFetchSpy.mockResolvedValue(orcidApiResponse);

      const ot = new ORCIDType(ORCID_examples.VALID);
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
      vi.clearAllMocks();
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

      const ot = new ORCIDType(ORCID_examples.VALID);
      await ot.init();

      expect(ot.isResolvable()).toBe(true);
    });
  });

  describe('renderPreview()', () => {
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
      vi.clearAllMocks();
    });

    it('returns a truthy functional component', async () => {
      cachedFetchSpy.mockResolvedValue(orcidApiResponse);

      const ot = new ORCIDType(ORCID_examples.VALID);
      await ot.init();

      const preview = ot.renderPreview();
      expect(preview).toBeTruthy();
    });
  });

  describe('data getter', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns serialized ORCIDInfo as JSON string', async () => {
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

      const ot = new ORCIDType(ORCID_examples.VALID);
      await ot.init();

      const data = ot.data;
      expect(typeof data).toBe('string');
      const parsed = JSON.parse(data);
      expect(parsed).toBeDefined();
    });
  });

  describe('init() with cached data', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('loads from cached data without fetching', async () => {
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

      const ot1 = new ORCIDType(ORCID_examples.VALID);
      await ot1.init();
      const cachedData = ot1.data;

      // Create a new instance and init with cached data
      vi.clearAllMocks();
      const ot2 = new ORCIDType(ORCID_examples.VALID);
      await ot2.init(cachedData);

      // Should NOT have called cachedFetch since we passed cached data
      expect(cachedFetchSpy).not.toHaveBeenCalled();
      expect(ot2.isResolvable()).toBe(true);
      expect(ot2.items.length).toBeGreaterThanOrEqual(1);
    });
  });
});
