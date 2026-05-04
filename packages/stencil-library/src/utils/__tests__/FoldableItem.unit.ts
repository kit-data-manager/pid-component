import { describe, expect, it } from 'vitest';
import { FoldableItem } from '../FoldableItem';

describe('FoldableItem', () => {
  describe('constructor', () => {
    it('creates a FoldableItem with all properties', () => {
      const item = new FoldableItem(1, 'key', 'value', 'tooltip', 'https://example.com', /test/, true);
      expect(item.priority).toBe(1);
      expect(item.keyTitle).toBe('key');
      expect(item.value).toBe('value');
      expect(item.keyTooltip).toBe('tooltip');
      expect(item.keyLink).toBe('https://example.com');
      expect(item.valueRegex).toEqual(/test/);
      expect(item.renderDynamically).toBe(true);
    });

    it('creates a FoldableItem with default renderDynamically', () => {
      const item = new FoldableItem(0, 'key', 'value');
      expect(item.renderDynamically).toBe(true);
      expect(item.estimatedTypePriority).toBe(0);
    });

    it('creates a FoldableItem with renderDynamically set to false', () => {
      const item = new FoldableItem(0, 'key', 'value', undefined, undefined, undefined, false);
      expect(item.renderDynamically).toBe(false);
      expect(item.estimatedTypePriority).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('priority', () => {
    it('returns the priority', () => {
      const item = new FoldableItem(5, 'key', 'value');
      expect(item.priority).toBe(5);
    });
  });

  describe('keyTitle', () => {
    it('returns the key title', () => {
      const item = new FoldableItem(0, 'Title', 'value');
      expect(item.keyTitle).toBe('Title');
    });
  });

  describe('value', () => {
    it('returns the value', () => {
      const item = new FoldableItem(0, 'key', 'my-value');
      expect(item.value).toBe('my-value');
    });
  });

  describe('keyTooltip', () => {
    it('returns undefined when not provided', () => {
      const item = new FoldableItem(0, 'key', 'value');
      expect(item.keyTooltip).toBeUndefined();
    });

    it('returns the tooltip when provided', () => {
      const item = new FoldableItem(0, 'key', 'value', 'my-tooltip');
      expect(item.keyTooltip).toBe('my-tooltip');
    });
  });

  describe('keyLink', () => {
    it('returns undefined when not provided', () => {
      const item = new FoldableItem(0, 'key', 'value');
      expect(item.keyLink).toBeUndefined();
    });

    it('returns the link when provided', () => {
      const item = new FoldableItem(0, 'key', 'value', undefined, 'https://example.com');
      expect(item.keyLink).toBe('https://example.com');
    });
  });

  describe('valueRegex', () => {
    it('returns undefined when not provided', () => {
      const item = new FoldableItem(0, 'key', 'value');
      expect(item.valueRegex).toBeUndefined();
    });

    it('returns the regex when provided', () => {
      const item = new FoldableItem(0, 'key', 'value', undefined, undefined, /^\d+$/);
      expect(item.valueRegex).toEqual(/^\d+$/);
    });
  });

  describe('renderDynamically', () => {
    it('returns true by default', () => {
      const item = new FoldableItem(0, 'key', 'value');
      expect(item.renderDynamically).toBe(true);
    });

    it('returns false when explicitly set', () => {
      const item = new FoldableItem(0, 'key', 'value', undefined, undefined, undefined, false);
      expect(item.renderDynamically).toBe(false);
    });
  });

  describe('estimatedTypePriority', () => {
    it('returns 0 when renderDynamically is true', () => {
      const item = new FoldableItem(0, 'key', 'value');
      expect(item.estimatedTypePriority).toBe(0);
    });

    it('returns MAX_SAFE_INTEGER when renderDynamically is false', () => {
      const item = new FoldableItem(0, 'key', 'value', undefined, undefined, undefined, false);
      expect(item.estimatedTypePriority).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('isValidValue()', () => {
    it('returns true when no regex is set', () => {
      const item = new FoldableItem(0, 'key', 'any-value');
      expect(item.isValidValue()).toBe(true);
    });

    it('returns true when value matches regex', () => {
      const item = new FoldableItem(0, 'key', '123', undefined, undefined, /^\d+$/);
      expect(item.isValidValue()).toBe(true);
    });

    it('returns false when value does not match regex', () => {
      const item = new FoldableItem(0, 'key', 'abc', undefined, undefined, /^\d+$/);
      expect(item.isValidValue()).toBe(false);
    });

    it('handles regex with special characters', () => {
      const item = new FoldableItem(0, 'key', 'test@example.com', undefined, undefined, /^[\w.]+@[\w.]+$/);
      expect(item.isValidValue()).toBe(true);
    });
  });

  describe('equals()', () => {
    it('returns true for identical items', () => {
      const item1 = new FoldableItem(1, 'key', 'value', 'tooltip', 'https://example.com', undefined, true);
      const item2 = new FoldableItem(1, 'key', 'value', 'tooltip', 'https://example.com', undefined, true);
      expect(item1.equals(item2)).toBe(true);
    });

    it('returns false for different keyTitle', () => {
      const item1 = new FoldableItem(1, 'key1', 'value');
      const item2 = new FoldableItem(1, 'key2', 'value');
      expect(item1.equals(item2)).toBe(false);
    });

    it('returns false for different value', () => {
      const item1 = new FoldableItem(1, 'key', 'value1');
      const item2 = new FoldableItem(1, 'key', 'value2');
      expect(item1.equals(item2)).toBe(false);
    });

    it('returns false for different keyTooltip', () => {
      const item1 = new FoldableItem(1, 'key', 'value', 'tooltip1');
      const item2 = new FoldableItem(1, 'key', 'value', 'tooltip2');
      expect(item1.equals(item2)).toBe(false);
    });

    it('returns false for different keyLink', () => {
      const item1 = new FoldableItem(1, 'key', 'value', undefined, 'https://example.com');
      const item2 = new FoldableItem(1, 'key', 'value', undefined, 'https://example.org');
      expect(item1.equals(item2)).toBe(false);
    });

    it('returns false for different renderDynamically', () => {
      const item1 = new FoldableItem(1, 'key', 'value', undefined, undefined, undefined, true);
      const item2 = new FoldableItem(1, 'key', 'value', undefined, undefined, undefined, false);
      expect(item1.equals(item2)).toBe(false);
    });

    it('ignores priority in comparison', () => {
      const item1 = new FoldableItem(1, 'key', 'value');
      const item2 = new FoldableItem(5, 'key', 'value');
      expect(item1.equals(item2)).toBe(true);
    });

    it('ignores valueRegex in comparison', () => {
      const item1 = new FoldableItem(1, 'key', 'value', undefined, undefined, /test1/);
      const item2 = new FoldableItem(1, 'key', 'value', undefined, undefined, /test2/);
      expect(item1.equals(item2)).toBe(true);
    });
  });
});