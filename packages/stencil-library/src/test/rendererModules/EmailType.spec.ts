import { EmailType } from '../../rendererModules/EmailType';

describe('EmailType', () => {
  describe('hasCorrectFormatQuick()', () => {
    it('returns true for a simple email address', () => {
      const et = new EmailType('test@example.com');
      expect(et.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for comma-separated emails', () => {
      const et = new EmailType('alice@example.com, bob@example.com');
      expect(et.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for email with dots and hyphens in local part', () => {
      const et = new EmailType('first.last-name@sub.domain.org');
      expect(et.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns false for empty string', () => {
      const et = new EmailType('');
      expect(et.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for string without @ sign', () => {
      const et = new EmailType('not-an-email');
      expect(et.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for string with @ but missing domain', () => {
      const et = new EmailType('user@');
      expect(et.hasCorrectFormatQuick()).toBe(false);
    });

    it('handles repeated calls correctly (regex lastIndex reset)', () => {
      const et = new EmailType('test@example.com');
      expect(et.hasCorrectFormatQuick()).toBe(true);
      expect(et.hasCorrectFormatQuick()).toBe(true);
    });
  });

  describe('hasCorrectFormat()', () => {
    it('matches hasCorrectFormatQuick() for a valid email', async () => {
      const et = new EmailType('user@domain.com');
      expect(await et.hasCorrectFormat()).toBe(et.hasCorrectFormatQuick());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "EmailType"', () => {
      const et = new EmailType('test@example.com');
      expect(et.getSettingsKey()).toBe('EmailType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const et = new EmailType('test@example.com');
      expect(et.value).toBe('test@example.com');
    });
  });

  describe('init()', () => {
    it('completes without error', () => {
      const et = new EmailType('test@example.com');
      expect(et.init()).toBeUndefined();
    });

    it('does not populate items (EmailType has no init logic)', () => {
      const et = new EmailType('alice@example.com, bob@example.com');
      et.init();
      // EmailType.init() is a no-op; items remain empty
      expect(et.items).toEqual([]);
    });
  });

  describe('renderPreview()', () => {
    it('returns a defined value for a single email', () => {
      const et = new EmailType('test@example.com');
      const preview = et.renderPreview();
      expect(preview).toBeDefined();
    });

    it('returns a defined value for comma-separated emails', () => {
      const et = new EmailType('alice@example.com, bob@example.com');
      const preview = et.renderPreview();
      expect(preview).toBeDefined();
    });
  });
});
