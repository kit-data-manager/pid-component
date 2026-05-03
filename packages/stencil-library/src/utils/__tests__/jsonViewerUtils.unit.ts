import { describe, expect, it } from 'vitest';
import {
  sanitizeData,
  expandNodeRecursive,
  getNodeType,
  getNodeInfo,
  formatCodeLine,
  getItemCountText,
  getValueDisplay,
  parseJsonSafe,
} from '../jsonViewerUtils';

describe('jsonViewerUtils', () => {
  describe('sanitizeData', () => {
    it('returns primitive values unchanged', () => {
      expect(sanitizeData('hello')).toBe('hello');
      expect(sanitizeData(42)).toBe(42);
      expect(sanitizeData(true)).toBe(true);
      expect(sanitizeData(null)).toBe(null);
      expect(sanitizeData(undefined)).toBe(undefined);
    });

    it('removes keys starting with $ from objects', () => {
      const input = {
        $id: 'should-remove',
        name: 'keep',
        $hidden: 'remove',
        value: 123,
      };
      const result = sanitizeData(input) as Record<string, unknown>;
      expect(result).toEqual({ name: 'keep', value: 123 });
      expect(result.$id).toBeUndefined();
      expect(result.$hidden).toBeUndefined();
    });

    it('recursively sanitizes nested objects', () => {
      const input = {
        $meta: 'remove',
        nested: {
          $internal: 'remove',
          data: 'keep',
        },
      };
      const result = sanitizeData(input) as Record<string, unknown>;
      expect(result).toEqual({ nested: { data: 'keep' } });
    });

    it('handles arrays recursively', () => {
      const input = [
        { $removed: true, keep: 'yes' },
        { $also: 'removed', keep2: 'yes2' },
      ];
      const result = sanitizeData(input) as Array<Record<string, unknown>>;
      expect(result).toEqual([{ keep: 'yes' }, { keep2: 'yes2' }]);
    });

    it('handles deeply nested structures', () => {
      const input = {
        level1: {
          $hidden: 'remove',
          level2: {
            $secret: 'remove',
            level3: {
              $internal: 'remove',
              value: 'deep',
            },
          },
        },
      };
      const result = sanitizeData(input);
      expect(result).toEqual({ level1: { level2: { level3: { value: 'deep' } } } });
    });

    it('handles empty objects', () => {
      expect(sanitizeData({})).toEqual({});
    });

    it('handles empty arrays', () => {
      expect(sanitizeData([])).toEqual([]);
    });

    it('handles objects with only $ keys', () => {
      const input = { $a: 1, $b: 2 };
      expect(sanitizeData(input)).toEqual({});
    });
  });

  describe('expandNodeRecursive', () => {
    it('adds only object/array paths, not primitive values', () => {
      const data = { name: 'test', value: 123 };
      const result = expandNodeRecursive(data, 'root', new Set());
      expect(result.has('root')).toBe(true);
      expect(result.has('root.name')).toBe(false);
      expect(result.has('root.value')).toBe(false);
    });

    it('handles nested objects recursively', () => {
      const data = {
        level1: {
          level2: {
            value: 'deep',
          },
        },
      };
      const result = expandNodeRecursive(data, 'root', new Set());
      expect(result.has('root')).toBe(true);
      expect(result.has('root.level1')).toBe(true);
      expect(result.has('root.level1.level2')).toBe(true);
    });

    it('handles arrays - primitives are leaf nodes without paths', () => {
      const data = ['a', 'b', 'c'];
      const result = expandNodeRecursive(data, 'root', new Set());
      expect(result.has('root')).toBe(true);
      expect(result.has('root.0')).toBe(false);
      expect(result.has('root.1')).toBe(false);
      expect(result.has('root.2')).toBe(false);
    });

    it('handles mixed arrays and objects', () => {
      const data = {
        items: [
          { id: 1, name: 'first' },
          { id: 2, name: 'second' },
        ],
      };
      const result = expandNodeRecursive(data, 'root', new Set());
      expect(result.has('root')).toBe(true);
      expect(result.has('root.items')).toBe(true);
      expect(result.has('root.items.0')).toBe(true);
      expect(result.has('root.items.1')).toBe(true);
      expect(result.has('root.items.0.id')).toBe(false);
      expect(result.has('root.items.0.name')).toBe(false);
    });

    it('does not modify primitive values', () => {
      const result = expandNodeRecursive('primitive', 'path', new Set(['existing']));
      expect(result.has('path')).toBe(false);
      expect(result.has('existing')).toBe(true);
    });

    it('returns a new Set instance', () => {
      const original = new Set([' preexisting']);
      const result = expandNodeRecursive({ a: 1 }, 'root', original);
      expect(result).not.toBe(original);
      expect(result).toBeInstanceOf(Set);
    });
  });

  describe('getNodeType', () => {
    it('returns object for plain objects', () => {
      expect(getNodeType({})).toBe('object');
      expect(getNodeType({ key: 'value' })).toBe('object');
    });

    it('returns array for arrays', () => {
      expect(getNodeType([])).toBe('array');
      expect(getNodeType([1, 2, 3])).toBe('array');
    });

    it('returns primitive for non-objects', () => {
      expect(getNodeType('string')).toBe('primitive');
      expect(getNodeType(42)).toBe('primitive');
      expect(getNodeType(true)).toBe('primitive');
      expect(getNodeType(null)).toBe('primitive');
      expect(getNodeType(undefined)).toBe('primitive');
    });
  });

  describe('getNodeInfo', () => {
    it('returns correct info for object', () => {
      const data = { key: 'value' };
      const result = getNodeInfo(data, 'myKey', 'path');
      expect(result).toEqual({
        key: 'myKey',
        value: data,
        path: 'path',
        isExpandable: true,
        isArray: false,
        itemCount: 1,
      });
    });

    it('returns correct info for array', () => {
      const data = [1, 2, 3];
      const result = getNodeInfo(data, 'myArray', 'arr');
      expect(result).toEqual({
        key: 'myArray',
        value: data,
        path: 'arr',
        isExpandable: true,
        isArray: true,
        itemCount: 3,
      });
    });

    it('returns correct info for primitive', () => {
      const result = getNodeInfo('string', 'str', 'path');
      expect(result).toEqual({
        key: 'str',
        value: 'string',
        path: 'path',
        isExpandable: false,
        isArray: false,
      });
    });

    it('handles empty object', () => {
      const result = getNodeInfo({}, 'empty', 'path');
      expect(result.itemCount).toBe(0);
    });
  });

  describe('formatCodeLine', () => {
    it('formats string values in light mode', () => {
      const line = '"key": "value"';
      const result = formatCodeLine(line, false);
      expect(result).toContain('text-green-600');
      expect(result).toContain('"key"');
      expect(result).toContain('"value"');
    });

    it('formats string values in dark mode', () => {
      const line = '"key": "value"';
      const result = formatCodeLine(line, true);
      expect(result).toContain('text-green-400');
    });

    it('formats boolean values', () => {
      const line = '"flag": true,';
      const result = formatCodeLine(line, false);
      expect(result).toContain('text-purple-600');
      expect(result).toContain('true');
    });

    it('formats null values', () => {
      const line = '"empty": null }';
      const result = formatCodeLine(line, false);
      expect(result).toContain('text-gray-500');
      expect(result).toContain('null');
    });

    it('formats number values', () => {
      const line = '"count": 42,';
      const result = formatCodeLine(line, false);
      expect(result).toContain('text-blue-600');
      expect(result).toContain('42');
    });

    it('formats floating point numbers', () => {
      const line = '"pi": 3.14159,';
      const result = formatCodeLine(line, false);
      expect(result).toContain('3.14159');
    });

    it('handles complex JSON lines', () => {
      const line = '"nested": { "key": "value" },';
      const result = formatCodeLine(line, false);
      expect(result).toContain('"nested"');
    });
  });

  describe('getItemCountText', () => {
    it('returns singular for 1 item', () => {
      expect(getItemCountText(1)).toBe('1 item');
    });

    it('returns plural for 0 items', () => {
      expect(getItemCountText(0)).toBe('0 items');
    });

    it('returns plural for multiple items', () => {
      expect(getItemCountText(2)).toBe('2 items');
      expect(getItemCountText(100)).toBe('100 items');
    });
  });

  describe('getValueDisplay', () => {
    it('returns correct display for string', () => {
      const result = getValueDisplay('hello');
      expect(result.display).toBe('"hello"');
      expect(result.type).toBe('string');
    });

    it('returns correct display for number', () => {
      const result = getValueDisplay(42);
      expect(result.display).toBe('42');
      expect(result.type).toBe('number');
    });

    it('returns correct display for boolean', () => {
      expect(getValueDisplay(true)).toEqual({ display: 'true', type: 'boolean' });
      expect(getValueDisplay(false)).toEqual({ display: 'false', type: 'boolean' });
    });

    it('returns correct display for null', () => {
      const result = getValueDisplay(null);
      expect(result.display).toBe('null');
      expect(result.type).toBe('null');
    });

    it('returns correct display for object', () => {
      const result = getValueDisplay({ key: 'value' });
      expect(result.display).toBe('{"key":"value"}');
      expect(result.type).toBe('object');
    });

    it('returns correct display for array', () => {
      const result = getValueDisplay([1, 2, 3]);
      expect(result.display).toBe('[1,2,3]');
      expect(result.type).toBe('object');
    });
  });

  describe('parseJsonSafe', () => {
    it('parses valid JSON string', () => {
      const result = parseJsonSafe('{"key":"value"}');
      expect(result.error).toBeNull();
      expect(result.data).toEqual({ key: 'value' });
    });

    it('returns object unchanged', () => {
      const obj = { key: 'value' };
      const result = parseJsonSafe(obj);
      expect(result.error).toBeNull();
      expect(result.data).toBe(obj);
    });

    it('returns error for invalid JSON', () => {
      const result = parseJsonSafe('invalid json');
      expect(result.error).toBeTruthy();
      expect(result.data).toBeNull();
    });

    it('returns error for null input', () => {
      expect(parseJsonSafe(null).error).toBeTruthy();
      expect(parseJsonSafe(undefined).error).toBeTruthy();
    });

    it('returns error for non-string non-object input', () => {
      expect(parseJsonSafe(42 as any).error).toBeTruthy();
      expect(parseJsonSafe(true as any).error).toBeTruthy();
    });

    it('parses nested JSON', () => {
      const json = JSON.stringify({ nested: { data: [1, 2, 3] } });
      const result = parseJsonSafe(json);
      expect(result.error).toBeNull();
      expect(result.data).toEqual({ nested: { data: [1, 2, 3] } });
    });

    it('returns error message for JSON parse errors', () => {
      const result = parseJsonSafe('{"incomplete":');
      expect(result.error).toContain('Unexpected end');
    });
  });
});