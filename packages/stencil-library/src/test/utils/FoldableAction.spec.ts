import { describe, it, expect, beforeEach } from 'vitest';
import { FoldableAction } from '../../utils/FoldableAction';

describe('FoldableAction', () => {
  describe('constructor', () => {
    it('sets all properties correctly', () => {
      const action = new FoldableAction(1, 'Click Me', 'https://example.com', 'primary');

      expect(action.priority).toBe(1);
      expect(action.title).toBe('Click Me');
      expect(action.link).toBe('https://example.com');
      expect(action.style).toBe('primary');
    });

    it('accepts secondary style', () => {
      const action = new FoldableAction(2, 'Cancel', '/cancel', 'secondary');

      expect(action.style).toBe('secondary');
    });

    it('accepts danger style', () => {
      const action = new FoldableAction(3, 'Delete', '/delete', 'danger');

      expect(action.style).toBe('danger');
    });
  });

  describe('getters', () => {
    let action: FoldableAction;

    beforeEach(() => {
      action = new FoldableAction(10, 'Submit', 'https://submit.example.com', 'primary');
    });

    it('priority returns the correct value', () => {
      expect(action.priority).toBe(10);
    });

    it('title returns the correct value', () => {
      expect(action.title).toBe('Submit');
    });

    it('link returns the correct value', () => {
      expect(action.link).toBe('https://submit.example.com');
    });

    it('style returns the correct value', () => {
      expect(action.style).toBe('primary');
    });
  });

  describe('equals()', () => {
    it('returns true for identical actions', () => {
      const action1 = new FoldableAction(1, 'Title', 'https://link.com', 'primary');
      const action2 = new FoldableAction(1, 'Title', 'https://link.com', 'primary');

      expect(action1.equals(action2)).toBe(true);
    });

    it('returns false when priority differs', () => {
      const action1 = new FoldableAction(1, 'Title', 'https://link.com', 'primary');
      const action2 = new FoldableAction(2, 'Title', 'https://link.com', 'primary');

      expect(action1.equals(action2)).toBe(false);
    });

    it('returns false when title differs', () => {
      const action1 = new FoldableAction(1, 'Title A', 'https://link.com', 'primary');
      const action2 = new FoldableAction(1, 'Title B', 'https://link.com', 'primary');

      expect(action1.equals(action2)).toBe(false);
    });

    it('returns false when link differs', () => {
      const action1 = new FoldableAction(1, 'Title', 'https://link1.com', 'primary');
      const action2 = new FoldableAction(1, 'Title', 'https://link2.com', 'primary');

      expect(action1.equals(action2)).toBe(false);
    });

    it('returns false when style differs', () => {
      const action1 = new FoldableAction(1, 'Title', 'https://link.com', 'primary');
      const action2 = new FoldableAction(1, 'Title', 'https://link.com', 'danger');

      expect(action1.equals(action2)).toBe(false);
    });

    it('is symmetric — a.equals(b) implies b.equals(a)', () => {
      const action1 = new FoldableAction(1, 'Title', 'https://link.com', 'secondary');
      const action2 = new FoldableAction(1, 'Title', 'https://link.com', 'secondary');

      expect(action1.equals(action2)).toBe(true);
      expect(action2.equals(action1)).toBe(true);
    });

    it('returns false when all properties differ', () => {
      const action1 = new FoldableAction(1, 'A', 'https://a.com', 'primary');
      const action2 = new FoldableAction(2, 'B', 'https://b.com', 'danger');

      expect(action1.equals(action2)).toBe(false);
    });
  });
});
