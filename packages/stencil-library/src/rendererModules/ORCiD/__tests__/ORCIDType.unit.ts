// Polyfill `self` before any module imports (DataCache uses `self.caches`)
(globalThis as any).self = globalThis;

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ORCIDType } from '../ORCIDType';
import * as DataCache from '../../../utils/DataCache';

const VALID = '0009-0005-2800-4833';
const VALID_WITH_HTTPS = 'https://orcid.org/0009-0005-2800-4833';
const INVALID_NOT_AN_ORCID = 'not-an-orcid';

let cachedFetchSpy: any;
beforeEach(() => {
  cachedFetchSpy = vi.spyOn(DataCache, 'cachedFetch');
});
afterEach(() => {
  cachedFetchSpy.mockRestore();
});

describe('ORCIDType', () => {
  describe('quickCheck()', () => {
    it('returns true for a bare ORCiD', () => {
      const ot = new ORCIDType(VALID);
      expect(ot.quickCheck()).toBe(true);
    });

    it('returns true for ORCiD with prefix URL', () => {
      const ot = new ORCIDType(VALID_WITH_HTTPS);
      expect(ot.quickCheck()).toBe(true);
    });

    it('returns false for non-ORCiD string', () => {
      const ot = new ORCIDType(INVALID_NOT_AN_ORCID);
      expect(ot.quickCheck()).toBe(false);
    });

    it('returns false for empty string', () => {
      const ot = new ORCIDType('');
      expect(ot.quickCheck()).toBe(false);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('matches quickCheck() result', async () => {
      const ot = new ORCIDType(VALID);
      expect(await ot.hasMeaningfulInformation()).toBe(ot.quickCheck());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "ORCIDType"', () => {
      const ot = new ORCIDType(VALID);
      expect(ot.getSettingsKey()).toBe('ORCIDType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const ot = new ORCIDType(VALID);
      expect(ot.value).toBe(VALID);
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

      const ot = new ORCIDType(VALID);
      await ot.init();

      expect(ot.items.length).toBeGreaterThanOrEqual(1);
      expect(ot.items[0].keyTitle).toBe('ORCiD');
      expect(ot.actions.length).toBeGreaterThanOrEqual(1);
      expect(ot.actions[0].title).toBe('Open ORCiD profile');
    });

    it('adds primary email item and mailto action', async () => {
      cachedFetchSpy.mockResolvedValue(orcidApiResponse);

      const ot = new ORCIDType(VALID);
      await ot.init();

      const emailItem = ot.items.find(i => i.keyTitle === 'Primary E-Mail address');
      expect(emailItem).toBeDefined();
      expect(emailItem.value).toBe('maximilian.inckmann@kit.edu');

      const emailAction = ot.actions.find(a => a.title === 'Send E-Mail');
      expect(emailAction).toBeDefined();
    });

    it('adds other email addresses item when non-primary emails exist', async () => {
      const responseWithMultipleEmails = {
        ...orcidApiResponse,
        person: {
          ...orcidApiResponse.person,
          emails: {
            email: [
              { email: 'primary@example.org', primary: true, verified: true },
              { email: 'other1@example.org', primary: false, verified: true },
              { email: 'other2@example.org', primary: false, verified: false },
            ],
          },
        },
      };
      cachedFetchSpy.mockResolvedValue(responseWithMultipleEmails);

      const ot = new ORCIDType(VALID);
      await ot.init();

      const otherEmailItem = ot.items.find(i => i.keyTitle === 'Other E-Mail addresses');
      expect(otherEmailItem).toBeDefined();
      expect(otherEmailItem.value).toContain('other1@example.org');
      expect(otherEmailItem.value).toContain('other2@example.org');
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

      const ot = new ORCIDType(VALID);
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

      const ot = new ORCIDType(VALID);
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

      const ot = new ORCIDType(VALID);
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

      const ot1 = new ORCIDType(VALID);
      await ot1.init();
      const cachedData = ot1.data;

      // Create a new instance and init with cached data
      vi.clearAllMocks();
      const ot2 = new ORCIDType(VALID);
      await ot2.init(cachedData);

      // Should NOT have called cachedFetch since we passed cached data
      expect(cachedFetchSpy).not.toHaveBeenCalled();
      expect(ot2.isResolvable()).toBe(true);
      expect(ot2.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('init() with researcherUrls', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('adds researcher URL items', async () => {
      cachedFetchSpy.mockResolvedValue({
        person: {
          name: { 'given-names': { value: 'Max' }, 'family-name': { value: 'Doe' } },
          biography: null,
          emails: { email: [] },
          keywords: { keyword: [] },
          'researcher-urls': {
            'researcher-url': [
              { 'url-name': 'Website', url: { value: 'https://example.com' }, 'display-index': 0 },
              { 'url-name': 'Blog', url: { value: 'https://blog.com' }, 'display-index': 1 },
            ],
          },
          addresses: { address: [] },
        },
        preferences: { locale: null },
        'activities-summary': { employments: { 'affiliation-group': [] } },
      });

      const ot = new ORCIDType(VALID);
      await ot.init();

      expect(ot.items.length).toBeGreaterThan(1);
      const urlItems = ot.items.filter(i => i.keyTitle.includes('reference') || i.keyTitle.includes('Website') || i.keyTitle.includes('Blog'));
      expect(urlItems.length).toBe(2);
    });

    it('uses default name when researcher URL name is empty', async () => {
      cachedFetchSpy.mockResolvedValue({
        person: {
          name: { 'given-names': { value: 'Max' }, 'family-name': { value: 'Doe' } },
          biography: null,
          emails: { email: [] },
          keywords: { keyword: [] },
          'researcher-urls': {
            'researcher-url': [
              { 'url-name': '', url: { value: 'https://example.com' }, 'display-index': 0 },
            ],
          },
          addresses: { address: [] },
        },
        preferences: { locale: null },
        'activities-summary': { employments: { 'affiliation-group': [] } },
      });

      const ot = new ORCIDType(VALID);
      await ot.init();

      const urlItem = ot.items.find(i => i.keyTitle.includes('reference'));
      expect(urlItem).toBeDefined();
    });
  });

  describe('init() with many keywords', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('adds keywords item when more than 50 keywords', async () => {
      const manyKeywords = Array.from({ length: 51 }, (_, i) => ({
        content: `keyword${i}`,
        index: i,
      }));

      cachedFetchSpy.mockResolvedValue({
        person: {
          name: { 'given-names': { value: 'Max' }, 'family-name': { value: 'Doe' } },
          biography: null,
          emails: { email: [] },
          keywords: { keyword: manyKeywords },
          'researcher-urls': { 'researcher-url': [] },
          addresses: { address: [] },
        },
        preferences: { locale: null },
        'activities-summary': { employments: { 'affiliation-group': [] } },
      });

      const ot = new ORCIDType(VALID);
      await ot.init();

      const keywordItem = ot.items.find(i => i.keyTitle === 'Keywords');
      expect(keywordItem).toBeDefined();
    });
  });
});
