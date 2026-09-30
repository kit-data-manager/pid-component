import { describe, expect, it } from 'vitest';
import { toInputValue } from '../duration-calculator-utils';

describe('toInputValue', () => {
  it('drops a trailing zero seconds component so values read as clean minutes', () => {
    expect(toInputValue('2024-01-08T02:00:00')).toBe('2024-01-08T02:00');
    expect(toInputValue('2024-01-08T02:00:00.000')).toBe('2024-01-08T02:00');
  });

  it('preserves nonzero seconds', () => {
    expect(toInputValue('2024-01-08T02:00:30')).toBe('2024-01-08T02:00:30');
  });

  it('preserves fractional seconds so adding a fraction is not lossy', () => {
    expect(toInputValue('2024-01-01T00:00:00.5')).toBe('2024-01-01T00:00:00.5');
    expect(toInputValue('2024-01-01T00:00:30.25')).toBe('2024-01-01T00:00:30.25');
  });
});
