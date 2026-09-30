import { describe, expect, it, vi } from 'vitest';
import { DurationType } from '../DurationType';
import { parseDuration } from '../../date-common/iso';

// The duration-calculator child component uses Stencil decorators that require
// Stencil's platform, which is not available in a plain vitest unit test. Mock
// it so importing DurationType (which registers it) does not throw.
vi.mock('../../../components/duration-calculator/duration-calculator', () => ({
  default: class DurationCalculator {
    render() {}
  },
}));

describe('DurationType', () => {
  describe('quickCheck()', () => {
    it('returns true for a date+time duration', () => {
      const dt = new DurationType('P7DT2H');
      expect(dt.quickCheck()).toBe(true);
    });

    it('returns true for a week duration', () => {
      const dt = new DurationType('P2W');
      expect(dt.quickCheck()).toBe(true);
    });

    it('returns true for a fractional duration', () => {
      const dt = new DurationType('PT1.5H');
      expect(dt.quickCheck()).toBe(true);
    });

    it('returns false for a datetime (handled by DateType)', () => {
      const dt = new DurationType('2023-01-18T09:21:00');
      expect(dt.quickCheck()).toBe(false);
    });

    it('returns false for a plain date', () => {
      const dt = new DurationType('2024-06-15');
      expect(dt.quickCheck()).toBe(false);
    });

    it('returns false for random text', () => {
      const dt = new DurationType('7 days');
      expect(dt.quickCheck()).toBe(false);
    });
  });

  describe('init()', () => {
    it('populates items from parsed duration components', async () => {
      const dt = new DurationType('P7DT2H');
      await dt.init();
      const titles = dt.items.map(item => item.keyTitle);
      expect(titles).toEqual(['Days', 'Hours']);
      expect(dt.items[0].value).toBe('7');
      expect(dt.items[1].value).toBe('2');
    });

    it('maps all present components to items', async () => {
      const dt = new DurationType('P1Y2M3DT4H5M6S');
      await dt.init();
      const titles = dt.items.map(item => item.keyTitle);
      expect(titles).toEqual(['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds']);
    });

    it('renders a humanized preview', async () => {
      const dt = new DurationType('P7DT2H');
      await dt.init();
      // renderPreview returns a vnode; just assert truthiness.
      expect(dt.renderPreview()).toBeTruthy();
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "DurationType"', () => {
      const dt = new DurationType('P7DT2H');
      expect(dt.getSettingsKey()).toBe('DurationType');
    });
  });

  describe('opensByDefault()', () => {
    it('returns true so the calculator is visible without expanding', () => {
      const dt = new DurationType('P7DT2H');
      expect(dt.opensByDefault()).toBe(true);
    });
  });

  describe('renderBody()', () => {
    it('returns undefined before init', () => {
      const dt = new DurationType('P7DT2H');
      expect(dt.renderBody()).toBeUndefined();
    });

    it('returns a calculator after init', async () => {
      const dt = new DurationType('P7DT2H');
      await dt.init();
      expect(dt.renderBody()).toBeTruthy();
    });
  });

  describe('parseDuration', () => {
    it('parses components correctly', () => {
      const parts = parseDuration('P1Y2M3DT4H5M6S')!;
      expect(parts.years).toBe(1);
      expect(parts.months).toBe(2);
      expect(parts.days).toBe(3);
      expect(parts.hours).toBe(4);
      expect(parts.minutes).toBe(5);
      expect(parts.seconds).toBe(6);
    });
  });
});
