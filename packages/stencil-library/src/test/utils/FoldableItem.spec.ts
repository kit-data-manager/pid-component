import { FoldableItem } from '../../utils/FoldableItem';

describe('FoldableItem', () => {
  describe('constructor', () => {
    it('sets all properties correctly when all arguments are provided', () => {
      const regex = /^https:\/\//;
      const item = new FoldableItem(1, 'Key', 'https://example.com', 'A tooltip', 'https://link.com', regex, false);

      expect(item.priority).toBe(1);
      expect(item.keyTitle).toBe('Key');
      expect(item.value).toBe('https://example.com');
      expect(item.keyTooltip).toBe('A tooltip');
      expect(item.keyLink).toBe('https://link.com');
      expect(item.valueRegex).toBe(regex);
      expect(item.renderDynamically).toBe(false);
    });

    it('defaults renderDynamically to true when not provided', () => {
      const item = new FoldableItem(0, 'Title', 'Value');

      expect(item.renderDynamically).toBe(true);
    });

    it('defaults renderDynamically to true when explicitly passed undefined', () => {
      const item = new FoldableItem(0, 'Title', 'Value', undefined, undefined, undefined, undefined);

      expect(item.renderDynamically).toBe(true);
    });

    it('sets optional properties to undefined when not provided', () => {
      const item = new FoldableItem(0, 'Title', 'Value');

      expect(item.keyTooltip).toBeUndefined();
      expect(item.keyLink).toBeUndefined();
      expect(item.valueRegex).toBeUndefined();
    });
  });

  describe('getters', () => {
    let item: FoldableItem;

    beforeEach(() => {
      item = new FoldableItem(5, 'MyKey', 'MyValue', 'MyTooltip', 'https://my.link', /^\d+$/, true);
    });

    it('priority returns the correct value', () => {
      expect(item.priority).toBe(5);
    });

    it('keyTitle returns the correct value', () => {
      expect(item.keyTitle).toBe('MyKey');
    });

    it('value returns the correct value', () => {
      expect(item.value).toBe('MyValue');
    });

    it('keyTooltip returns the correct value', () => {
      expect(item.keyTooltip).toBe('MyTooltip');
    });

    it('keyLink returns the correct value', () => {
      expect(item.keyLink).toBe('https://my.link');
    });

    it('valueRegex returns the correct value', () => {
      expect(item.valueRegex).toEqual(/^\d+$/);
    });

    it('renderDynamically returns the correct value', () => {
      expect(item.renderDynamically).toBe(true);
    });
  });

  describe('estimatedTypePriority', () => {
    it('defaults to 0 when renderDynamically is true', () => {
      const item = new FoldableItem(1, 'Key', 'Value', undefined, undefined, undefined, true);

      expect(item.estimatedTypePriority).toBe(0);
    });

    it('defaults to 0 when renderDynamically is false', () => {
      const item = new FoldableItem(1, 'Key', 'Value', undefined, undefined, undefined, false);

      expect(item.estimatedTypePriority).toBe(0);
    });

    it('defaults to 0 when renderDynamically is not provided', () => {
      const item = new FoldableItem(1, 'Key', 'Value');

      expect(item.estimatedTypePriority).toBe(0);
    });
  });

  describe('isValidValue()', () => {
    it('returns true when no regex is set', () => {
      const item = new FoldableItem(0, 'Key', 'anything goes');

      expect(item.isValidValue()).toBe(true);
    });

    it('returns true when the value matches the regex', () => {
      const item = new FoldableItem(0, 'Key', '12345', undefined, undefined, /^\d+$/);

      expect(item.isValidValue()).toBe(true);
    });

    it('returns false when the value does not match the regex', () => {
      const item = new FoldableItem(0, 'Key', 'not-a-number', undefined, undefined, /^\d+$/);

      expect(item.isValidValue()).toBe(false);
    });

    it('returns true for a URL value matching a URL regex', () => {
      const item = new FoldableItem(0, 'Key', 'https://example.com', undefined, undefined, /^https:\/\//);

      expect(item.isValidValue()).toBe(true);
    });

    it('returns false for a non-URL value against a URL regex', () => {
      const item = new FoldableItem(0, 'Key', 'ftp://example.com', undefined, undefined, /^https:\/\//);

      expect(item.isValidValue()).toBe(false);
    });
  });

  describe('equals()', () => {
    it('returns true for identical items', () => {
      const item1 = new FoldableItem(1, 'Key', 'Value', 'Tooltip', 'Link', undefined, true);
      const item2 = new FoldableItem(1, 'Key', 'Value', 'Tooltip', 'Link', undefined, true);

      expect(item1.equals(item2)).toBe(true);
    });

    it('returns true when priority differs (priority is not compared in equals)', () => {
      const item1 = new FoldableItem(1, 'Key', 'Value', 'Tooltip', 'Link', undefined, true);
      const item2 = new FoldableItem(99, 'Key', 'Value', 'Tooltip', 'Link', undefined, true);

      // equals() does not compare priority
      expect(item1.equals(item2)).toBe(true);
    });

    it('returns false when keyTitle differs', () => {
      const item1 = new FoldableItem(1, 'Key1', 'Value', 'Tooltip', 'Link', undefined, true);
      const item2 = new FoldableItem(1, 'Key2', 'Value', 'Tooltip', 'Link', undefined, true);

      expect(item1.equals(item2)).toBe(false);
    });

    it('returns false when value differs', () => {
      const item1 = new FoldableItem(1, 'Key', 'Value1', 'Tooltip', 'Link', undefined, true);
      const item2 = new FoldableItem(1, 'Key', 'Value2', 'Tooltip', 'Link', undefined, true);

      expect(item1.equals(item2)).toBe(false);
    });

    it('returns false when keyTooltip differs', () => {
      const item1 = new FoldableItem(1, 'Key', 'Value', 'Tooltip1', 'Link', undefined, true);
      const item2 = new FoldableItem(1, 'Key', 'Value', 'Tooltip2', 'Link', undefined, true);

      expect(item1.equals(item2)).toBe(false);
    });

    it('returns false when keyLink differs', () => {
      const item1 = new FoldableItem(1, 'Key', 'Value', 'Tooltip', 'Link1', undefined, true);
      const item2 = new FoldableItem(1, 'Key', 'Value', 'Tooltip', 'Link2', undefined, true);

      expect(item1.equals(item2)).toBe(false);
    });

    it('returns false when renderDynamically differs', () => {
      const item1 = new FoldableItem(1, 'Key', 'Value', 'Tooltip', 'Link', undefined, true);
      const item2 = new FoldableItem(1, 'Key', 'Value', 'Tooltip', 'Link', undefined, false);

      expect(item1.equals(item2)).toBe(false);
    });

    it('returns true when both have undefined optional fields', () => {
      const item1 = new FoldableItem(1, 'Key', 'Value');
      const item2 = new FoldableItem(2, 'Key', 'Value');

      expect(item1.equals(item2)).toBe(true);
    });

    it('returns false when one has keyTooltip and the other does not', () => {
      const item1 = new FoldableItem(1, 'Key', 'Value', 'Tooltip');
      const item2 = new FoldableItem(1, 'Key', 'Value');

      expect(item1.equals(item2)).toBe(false);
    });
  });
});
