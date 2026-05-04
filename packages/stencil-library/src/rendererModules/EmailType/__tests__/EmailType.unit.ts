import { describe, expect, it } from 'vitest';
import { EmailType } from '../EmailType';

const EMAIL_examples = {
  VALID: 'someone@example.com',
  VALID_ALT: 'john.doe@demo.example',
  KIT_EMAIL: 'maximilian.inckmann@kit.edu',
  KIT_EMAIL_ALT: 'ys9159@kit.edu',
  INVALID_NOT_AN_EMAIL: 'not-an-email',
  INVALID_MISSING_DOMAIN: 'user@',
  INVALID_EMPTY: '',
} as const;

describe('EmailType', () => {
  describe('quickCheck()', () => {
    it('returns true for a simple email address', () => {
      const et = new EmailType(EMAIL_examples.VALID);
      expect(et.quickCheck()).toBe(true);
    });

    it('returns true for comma-separated emails', () => {
      const et = new EmailType('alice@example.com, bob@example.com');
      expect(et.quickCheck()).toBe(true);
    });

    it('returns true for email with dots and hyphens in local part', () => {
      const et = new EmailType(EMAIL_examples.VALID_ALT);
      expect(et.quickCheck()).toBe(true);
    });

    it('returns false for empty string', () => {
      const et = new EmailType(EMAIL_examples.INVALID_EMPTY);
      expect(et.quickCheck()).toBe(false);
    });

    it('returns false for string without @ sign', () => {
      const et = new EmailType(EMAIL_examples.INVALID_NOT_AN_EMAIL);
      expect(et.quickCheck()).toBe(false);
    });

    it('returns false for string with @ but missing domain', () => {
      const et = new EmailType(EMAIL_examples.INVALID_MISSING_DOMAIN);
      expect(et.quickCheck()).toBe(false);
    });

    it('handles repeated calls correctly (regex lastIndex reset)', () => {
      const et = new EmailType(EMAIL_examples.VALID);
      expect(et.quickCheck()).toBe(true);
      expect(et.quickCheck()).toBe(true);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('matches quickCheck() for a valid email', async () => {
      const et = new EmailType(EMAIL_examples.VALID);
      expect(await et.hasMeaningfulInformation()).toBe(et.quickCheck());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "EmailType"', () => {
      const et = new EmailType(EMAIL_examples.VALID);
      expect(et.getSettingsKey()).toBe('EmailType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const et = new EmailType(EMAIL_examples.VALID);
      expect(et.value).toBe(EMAIL_examples.VALID);
    });
  });

  describe('init()', () => {
    it('completes without error', async () => {
      const et = new EmailType(EMAIL_examples.VALID);
      await expect(et.init()).resolves.toBeUndefined();
    });

    it('does not populate items (EmailType has no init logic)', async () => {
      const et = new EmailType('alice@example.com, bob@example.com');
      await et.init();
      expect(et.items).toEqual([]);
    });
  });

  describe('renderPreview()', () => {
    it('returns a defined value for a single email', () => {
      const et = new EmailType(EMAIL_examples.VALID);
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
