import { describe, expect, it, vi } from 'vitest';
import { JSONType } from '../JSONType';

vi.mock('../../../components/json-viewer/json-viewer', () => ({
  default: class JsonViewer {
    render() {
    }
  },
}));

describe('JSONType', () => {
  describe('quickCheck()', () => {
    it('returns true for a JSON object string', () => {
      const jt = new JSONType('{"key":"value"}');
      expect(jt.quickCheck()).toBe(true);
    });

    it('returns true for a JSON array string', () => {
      const jt = new JSONType('[1,2,3]');
      expect(jt.quickCheck()).toBe(true);
    });

    it('returns true for nested JSON object', () => {
      const jt = new JSONType('{"a":{"b":1},"c":[1,2]}');
      expect(jt.quickCheck()).toBe(true);
    });

    it('returns false for plain text', () => {
      const jt = new JSONType('not json');
      expect(jt.quickCheck()).toBe(false);
    });

    it('returns false for a JSON primitive string "42"', () => {
      const jt = new JSONType('42');
      expect(jt.quickCheck()).toBe(false);
    });

    it('returns false for a JSON primitive string "true"', () => {
      const jt = new JSONType('true');
      expect(jt.quickCheck()).toBe(false);
    });

    it('returns false for empty string', () => {
      const jt = new JSONType('');
      expect(jt.quickCheck()).toBe(false);
    });

    it('returns true for JSON with whitespace', () => {
      const jt = new JSONType('  { "key": "value" }  ');
      expect(jt.quickCheck()).toBe(true);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('matches quickCheck() for valid JSON', async () => {
      const jt = new JSONType('{"key":"value"}');
      expect(await jt.hasMeaningfulInformation()).toBe(jt.quickCheck());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "JSONType"', () => {
      const jt = new JSONType('{}');
      expect(jt.getSettingsKey()).toBe('JSONType');
    });
  });

  describe('isResolvable()', () => {
    it('returns false (JSON does not need resolving)', () => {
      const jt = new JSONType('{"key":"value"}');
      expect(jt.isResolvable()).toBe(false);
    });
  });

  describe('init()', () => {
    it('resets parsed cache and resolves', async () => {
      const jt = new JSONType('{"key":"value"}');
      await expect(jt.init()).resolves.toBeUndefined();
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const jt = new JSONType('{"a":1}');
      expect(jt.value).toBe('{"a":1}');
    });
  });

  describe('init() behavior', () => {
    it('resets the parsed JSON cache', async () => {
      const jt = new JSONType('{"key":"value"}');
      // Access parsed JSON to populate the cache
      expect(jt.quickCheck()).toBe(true);
      // After init, the cache is reset but re-parsing yields the same result
      await jt.init();
      expect(jt.quickCheck()).toBe(true);
    });

    it('returns a resolved promise', async () => {
      const jt = new JSONType('{"key":"value"}');
      const result = jt.init();
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe('renderPreview()', () => {
    it('returns defined output for a JSON object', () => {
      const jt = new JSONType('{"key":"value"}');
      const preview = jt.renderPreview();
      expect(preview).toBeDefined();
    });

    it('returns defined output for a JSON array', () => {
      const jt = new JSONType('[1,2,3]');
      const preview = jt.renderPreview();
      expect(preview).toBeDefined();
    });

    it('returns defined output for invalid JSON', () => {
      const jt = new JSONType('not json');
      const preview = jt.renderPreview();
      expect(preview).toBeDefined();
    });
  });

  describe('renderBody()', () => {
    it('returns defined output for valid JSON', () => {
      const jt = new JSONType('{"key":"value"}');
      const body = jt.renderBody();
      expect(body).toBeDefined();
    });

    it('returns defined output for invalid JSON', () => {
      const jt = new JSONType('not json');
      const body = jt.renderBody();
      expect(body).toBeDefined();
    });
  });

  describe('data getter', () => {
    it('returns undefined (default GenericIdentifierType behavior)', () => {
      const jt = new JSONType('{"key":"value"}');
      expect(jt.data).toBeUndefined();
    });
  });
});
