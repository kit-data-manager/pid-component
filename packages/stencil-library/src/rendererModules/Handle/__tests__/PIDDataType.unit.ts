import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PIDDataType } from '../PIDDataType';
import { PID } from '../PID';

// Mock DOMParser for Node environment
const mockParseFromString = vi.fn();
global.DOMParser = class DOMParser {
  parseFromString(str: string, _type: string) {
    const locations: any[] = [];
    const locationRegex = /<location\s+([^>]*)>/gi;
    let match;
    while ((match = locationRegex.exec(str)) !== null) {
      const attrs = match[1];
      const loc: any = {
        getAttribute: (name: string) => {
          const match = attrs.match(new RegExp(`${name}="([^"]*)"`));
          return match ? match[1] : null;
        },
      };
      locations.push(loc);
    }
    const nodeList = [...locations];
    nodeList.item = (i: number) => locations[i] || null;
    return {
      querySelectorAll: () => [],
      getElementsByTagName: () => nodeList,
      documentElement: { textContent: str },
      body: { children: locations },
    };
  }
};

// Mock document for Node environment
if (typeof document === 'undefined') {
  global.document = {
    createElement: vi.fn(() => ({
      setAttribute: vi.fn(),
      style: {},
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      contains: vi.fn(() => false),
    })),
    createElementNS: vi.fn(() => ({})),
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    getElementById: vi.fn(() => null),
    body: { appendChild: vi.fn(), removeChild: vi.fn() },
  } as any;
}

// vi.hoisted() ensures these are available when vi.mock factories run
// (which are hoisted above all other code including const declarations).
const { mockTypeMap, mockUnresolvables, mockHandleMap, mockCachedFetch } = vi.hoisted(() => ({
  mockTypeMap: new Map(),
  mockUnresolvables: new Set(),
  mockHandleMap: new Map(),
  mockCachedFetch: vi.fn(),
}));

vi.mock('../../../utils/utils', () => ({
  handleMap: mockHandleMap,
  unresolvables: mockUnresolvables,
  typeMap: mockTypeMap,
}));
vi.mock('../../../utils/DataCache', () => ({
  cachedFetch: mockCachedFetch,
}));

describe('PIDDataType', () => {
  describe('constructor and getters', () => {
    it('stores all properties', () => {
      const pid = new PID('21.T11148', 'testtype');
      const dt = new PIDDataType(pid, 'TestName', 'A description', 'https://example.com', /^test$/);

      expect(dt.pid).toBe(pid);
      expect(dt.name).toBe('TestName');
      expect(dt.description).toBe('A description');
      expect(dt.redirectURL).toBe('https://example.com');
      expect(dt.regex).toEqual(/^test$/);
    });

    it('handles undefined regex', () => {
      const pid = new PID('21.T11148', 'testtype');
      const dt = new PIDDataType(pid, 'TestName', 'A description', 'https://example.com');

      expect(dt.regex).toBeUndefined();
    });
  });

  describe('fromJSON()', () => {
    it('reconstructs a PIDDataType from serialized JSON', () => {
      const pid = new PID('21.T11148', 'testtype');
      const original = new PIDDataType(pid, 'TestName', 'A description', 'https://example.com');
      const serialized = JSON.stringify(original.toObject());
      const restored = PIDDataType.fromJSON(serialized);

      expect(restored.name).toBe('TestName');
      expect(restored.description).toBe('A description');
      expect(restored.redirectURL).toBe('https://example.com');
      expect(restored.pid.prefix).toBe('21.T11148');
      expect(restored.pid.suffix).toBe('testtype');
    });
  });

  describe('toObject()', () => {
    it('serializes all properties', () => {
      const pid = new PID('21.T11148', 'testtype');
      const dt = new PIDDataType(pid, 'TestName', 'A description', 'https://example.com');
      const obj = dt.toObject();

      expect(obj.pid).toBeDefined();
      expect(obj.name).toBe('TestName');
      expect(obj.description).toBe('A description');
      expect(obj.redirectURL).toBe('https://example.com');
    });
  });

  describe('resolveDataType()', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockTypeMap.clear();
      mockUnresolvables.clear();
      mockHandleMap.clear();
    });

    it('returns undefined for non-resolvable PID', async () => {
      // PID with prefix "0" is not resolvable
      const pid = new PID('0', 'test');

      const result = await PIDDataType.resolveDataType(pid);

      expect(result).toBeUndefined();
    });

    it('returns cached PIDDataType if already in typeMap', async () => {
      const pid = new PID('21.T11148', 'cached');
      const cached = new PIDDataType(pid, 'Cached', 'Already cached', 'https://cached.com');
      mockTypeMap.set(pid, cached);

      const result = await PIDDataType.resolveDataType(pid);

      expect(result).toBe(cached);
      expect(result.name).toBe('Cached');
    });

    it('returns undefined when PID resolve() returns undefined', async () => {
      const pid = new PID('21.T11148', 'unresolvable');
      // Mock isResolvable to return true so we get past the first check
      vi.spyOn(pid, 'isResolvable').mockReturnValue(true);
      // Mock resolve to return undefined (API failure)
      vi.spyOn(pid, 'resolve').mockResolvedValue(undefined);

      const result = await PIDDataType.resolveDataType(pid);

      expect(result).toBeUndefined();
      expect(mockUnresolvables.has(pid)).toBe(true);
    });

    it('resolves a PID with 10320/loc XML containing json and html locations', async () => {
      const pid = new PID('21.T11148', '076759916209e5d62bd5');
      vi.spyOn(pid, 'isResolvable').mockReturnValue(true);

      // Build a mock PIDRecord with a 10320/Loc entry containing XML
      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
        <locations>
          <location href="https://dtr-test.pidconsortium.eu/api/v1/types/21.T11148/076759916209e5d62bd5" weight="0" view="json" />
          <location href="https://dtr-test.pidconsortium.eu/#objects/21.T11148/076759916209e5d62bd5" weight="1" view="html" />
        </locations>`;

      const mockRecord = {
        pid,
        values: [
          {
            index: 1,
            type: new PID('10320', 'loc'),
            data: { format: 'string', value: xmlData },
          },
        ],
      };

      vi.spyOn(pid, 'resolve').mockResolvedValue(mockRecord as any);

      // Mock cachedFetch to return ePIC registry data for the JSON location
      mockCachedFetch.mockResolvedValue({
        name: 'digitalObjectLocation',
        description: 'The location of a digital object',
      });

      const result = await PIDDataType.resolveDataType(pid);

      expect(result).toBeDefined();
      expect(result.name).toBe('digitalObjectLocation');
      expect(result.description).toBe('The location of a digital object');
      expect(result.redirectURL).toBe('https://dtr-test.pidconsortium.eu/#objects/21.T11148/076759916209e5d62bd5');
      expect(result.pid).toBe(pid);

      // Should be cached in typeMap
      expect(mockTypeMap.has(pid)).toBe(true);
      expect(mockTypeMap.get(pid)).toBe(result);
    });

    it('resolves a PID with only an html location (no json)', async () => {
      const pid = new PID('21.T11148', 'htmlonly');
      vi.spyOn(pid, 'isResolvable').mockReturnValue(true);

      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
        <locations>
          <location href="https://example.com/view" view="html" />
        </locations>`;

      const mockRecord = {
        pid,
        values: [
          {
            index: 1,
            type: new PID('10320', 'loc'),
            data: { format: 'string', value: xmlData },
          },
        ],
      };

      vi.spyOn(pid, 'resolve').mockResolvedValue(mockRecord as any);

      const result = await PIDDataType.resolveDataType(pid);

      expect(result).toBeDefined();
      expect(result.name).toBe('');
      expect(result.description).toBe('');
      expect(result.redirectURL).toBe('https://example.com/view');
    });

    it('resolves a PID with no 10320/loc entries (no location data)', async () => {
      const pid = new PID('21.T11148', 'noloc');
      vi.spyOn(pid, 'isResolvable').mockReturnValue(true);

      const mockRecord = {
        pid,
        values: [
          {
            index: 1,
            type: 'URL',
            data: { format: 'string', value: 'https://example.com' },
          },
        ],
      };

      vi.spyOn(pid, 'resolve').mockResolvedValue(mockRecord as any);

      const result = await PIDDataType.resolveDataType(pid);

      expect(result).toBeDefined();
      expect(result.name).toBe('');
      expect(result.description).toBe('');
    });

    it('handles cachedFetch failure gracefully', async () => {
      const pid = new PID('21.T11148', 'fetchfail');
      vi.spyOn(pid, 'isResolvable').mockReturnValue(true);

      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
        <locations>
          <location href="https://broken.example.com/api" view="json" />
        </locations>`;

      const mockRecord = {
        pid,
        values: [
          {
            index: 1,
            type: new PID('10320', 'loc'),
            data: { format: 'string', value: xmlData },
          },
        ],
      };

      vi.spyOn(pid, 'resolve').mockResolvedValue(mockRecord as any);
      mockCachedFetch.mockRejectedValue(new Error('Network error'));

      const result = await PIDDataType.resolveDataType(pid);

      // Should still create a PIDDataType with empty name/description
      expect(result).toBeDefined();
      expect(result.name).toBe('');
    });

    it('handles XML with weight attribute on locations', async () => {
      const pid = new PID('21.T11148', 'weighted');
      vi.spyOn(pid, 'isResolvable').mockReturnValue(true);

      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
        <locations>
          <location href="https://example.com/api" weight="10" view="json" />
        </locations>`;

      const mockRecord = {
        pid,
        values: [
          {
            index: 1,
            type: new PID('10320', 'loc'),
            data: { format: 'string', value: xmlData },
          },
        ],
      };

      vi.spyOn(pid, 'resolve').mockResolvedValue(mockRecord as any);
      mockCachedFetch.mockResolvedValue({
        name: 'WeightedType',
        description: 'A type with weight',
      });

      const result = await PIDDataType.resolveDataType(pid);

      expect(result).toBeDefined();
      expect(result.name).toBe('WeightedType');
    });

    it('matches locationType by string comparison when type is a string', async () => {
      const pid = new PID('21.T11148', 'stringtype');
      vi.spyOn(pid, 'isResolvable').mockReturnValue(true);

      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
        <locations>
          <location href="https://example.com/view" view="html" />
        </locations>`;

      const mockRecord = {
        pid,
        values: [
          {
            index: 1,
            // Type as string matching locationType.toString() = "10320/loc"
            type: '10320/loc',
            data: { format: 'string', value: xmlData },
          },
        ],
      };

      vi.spyOn(pid, 'resolve').mockResolvedValue(mockRecord as any);

      const result = await PIDDataType.resolveDataType(pid);

      expect(result).toBeDefined();
      expect(result.redirectURL).toBe('https://example.com/view');
    });
  });
});
