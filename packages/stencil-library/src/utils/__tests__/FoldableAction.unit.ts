import { describe, expect, it } from 'vitest';
import { FoldableAction } from '../FoldableAction';

describe('FoldableAction', () => {
  describe('constructor', () => {
    it('creates a FoldableAction with primary style', () => {
      const action = new FoldableAction(0, 'Open', 'https://example.com', 'primary');
      expect(action.priority).toBe(0);
      expect(action.title).toBe('Open');
      expect(action.link).toBe('https://example.com');
      expect(action.style).toBe('primary');
    });

    it('creates a FoldableAction with secondary style', () => {
      const action = new FoldableAction(1, 'Edit', 'https://example.com/edit', 'secondary');
      expect(action.style).toBe('secondary');
    });

    it('creates a FoldableAction with danger style', () => {
      const action = new FoldableAction(2, 'Delete', 'https://example.com/delete', 'danger');
      expect(action.style).toBe('danger');
    });
  });

  describe('priority', () => {
    it('returns the priority', () => {
      const action = new FoldableAction(5, 'Title', 'https://example.com', 'primary');
      expect(action.priority).toBe(5);
    });
  });

  describe('title', () => {
    it('returns the title', () => {
      const action = new FoldableAction(0, 'My Title', 'https://example.com', 'primary');
      expect(action.title).toBe('My Title');
    });
  });

  describe('link', () => {
    it('returns the link', () => {
      const action = new FoldableAction(0, 'Title', 'https://example.com/path', 'primary');
      expect(action.link).toBe('https://example.com/path');
    });
  });

  describe('style', () => {
    it('returns primary style', () => {
      const action = new FoldableAction(0, 'Title', 'https://example.com', 'primary');
      expect(action.style).toBe('primary');
    });

    it('returns secondary style', () => {
      const action = new FoldableAction(0, 'Title', 'https://example.com', 'secondary');
      expect(action.style).toBe('secondary');
    });

    it('returns danger style', () => {
      const action = new FoldableAction(0, 'Title', 'https://example.com', 'danger');
      expect(action.style).toBe('danger');
    });
  });

  describe('equals()', () => {
    it('returns true for identical actions', () => {
      const action1 = new FoldableAction(1, 'Open', 'https://example.com', 'primary');
      const action2 = new FoldableAction(1, 'Open', 'https://example.com', 'primary');
      expect(action1.equals(action2)).toBe(true);
    });

    it('returns false for different priority', () => {
      const action1 = new FoldableAction(1, 'Open', 'https://example.com', 'primary');
      const action2 = new FoldableAction(2, 'Open', 'https://example.com', 'primary');
      expect(action1.equals(action2)).toBe(false);
    });

    it('returns false for different title', () => {
      const action1 = new FoldableAction(1, 'Open', 'https://example.com', 'primary');
      const action2 = new FoldableAction(1, 'Close', 'https://example.com', 'primary');
      expect(action1.equals(action2)).toBe(false);
    });

    it('returns false for different link', () => {
      const action1 = new FoldableAction(1, 'Open', 'https://example.com', 'primary');
      const action2 = new FoldableAction(1, 'Open', 'https://example.org', 'primary');
      expect(action1.equals(action2)).toBe(false);
    });

    it('returns false for different style', () => {
      const action1 = new FoldableAction(1, 'Open', 'https://example.com', 'primary');
      const action2 = new FoldableAction(1, 'Open', 'https://example.com', 'secondary');
      expect(action1.equals(action2)).toBe(false);
    });
  });
});