import { describe, expect, it } from 'vitest';
import { parseDatetime, parseDuration, parseReducedDate } from '../iso';
import { addDurationToIso, formatDurationParts, formatDurationPartsIso, formatDatetimeIso, subtractDurationFromIso } from '../format';

describe('parseDatetime', () => {
  it('parses a full datetime with timezone', () => {
    const parts = parseDatetime('2022-11-11T08:01:20.557+00:00')!;
    expect(parts.date).toBe('2022-11-11');
    expect(parts.hasTime).toBe(true);
    expect(parts.timezoneOffsetMinutes).toBe(0);
  });

  it('parses a datetime with a positive timezone offset', () => {
    const parts = parseDatetime('2024-06-15T09:30:00.000+02:00')!;
    expect(parts.timezoneOffsetMinutes).toBe(120);
  });

  it('parses a datetime with a negative timezone offset', () => {
    const parts = parseDatetime('2024-01-01T00:00:00-05:00')!;
    expect(parts.timezoneOffsetMinutes).toBe(-300);
  });

  it('parses a local datetime without a timezone (timezoneOffsetMinutes undefined)', () => {
    const parts = parseDatetime('2023-01-18T09:21:00')!;
    expect(parts.date).toBe('2023-01-18');
    expect(parts.hasTime).toBe(true);
    expect(parts.time).toBe('09:21:00');
    expect(parts.timezoneOffsetMinutes).toBeUndefined();
  });

  it('parses a plain calendar date without time', () => {
    const parts = parseDatetime('2024-06-15')!;
    expect(parts.date).toBe('2024-06-15');
    expect(parts.hasTime).toBe(false);
    expect(parts.timezoneOffsetMinutes).toBeUndefined();
  });

  it('rejects an out-of-range day', () => {
    expect(parseDatetime('2024-02-30')).toBeNull();
  });

  it('rejects a zero day rather than normalizing to the previous month', () => {
    expect(parseDatetime('2024-01-00')).toBeNull();
    expect(parseDatetime('2024-06-00')).toBeNull();
  });

  it('rejects datetime with hour 24', () => {
    expect(parseDatetime('2024-01-01T24:00:00')).toBeNull();
  });

  it('rejects random text', () => {
    expect(parseDatetime('not-a-date')).toBeNull();
  });
});

describe('parseReducedDate', () => {
  it('parses a year-only value', () => {
    const parts = parseReducedDate('2023')!;
    expect(parts.year).toBe(2023);
    expect(parts.isReduced).toBe(true);
    expect(parts.day).toBeUndefined();
  });

  it('parses a year-month value', () => {
    const parts = parseReducedDate('2023-01')!;
    expect(parts.year).toBe(2023);
    expect(parts.month).toBe(1);
    expect(parts.isReduced).toBe(true);
  });

  it('rejects a full date (should be handled by parseDatetime)', () => {
    expect(parseReducedDate('2023-01-18')).toBeNull();
  });

  it('rejects random text', () => {
    expect(parseReducedDate('abc')).toBeNull();
  });
});

describe('parseDuration', () => {
  it('parses a date+time duration', () => {
    const parts = parseDuration('P7DT2H')!;
    expect(parts.days).toBe(7);
    expect(parts.hours).toBe(2);
    expect(parts.hasTime).toBe(true);
  });

  it('parses a week-only duration', () => {
    const parts = parseDuration('P2W')!;
    expect(parts.weeks).toBe(2);
    expect(parts.days).toBe(0);
    expect(parts.hasTime).toBe(false);
  });

  it('parses a fractional duration', () => {
    const parts = parseDuration('PT1.5H')!;
    expect(parts.hours).toBe(1.5);
  });

  it('rejects fractional calendar units (only time units may be fractional)', () => {
    expect(parseDuration('P1.5M')).toBeNull();
    expect(parseDuration('P0.5Y')).toBeNull();
    expect(parseDuration('P1.5W')).toBeNull();
    expect(parseDuration('P1.5D')).toBeNull();
  });

  it('parses a time-only duration', () => {
    const parts = parseDuration('PT2H30M')!;
    expect(parts.hours).toBe(2);
    expect(parts.minutes).toBe(30);
  });

  it('rejects an empty duration marker', () => {
    expect(parseDuration('P')).toBeNull();
  });

  it('parses a week form combined with other components', () => {
    expect(parseDuration('P1W1D')).not.toBeNull();
    expect(parseDuration('P1Y1W')).not.toBeNull();
  });

  it('accepts a standalone week form', () => {
    expect(parseDuration('P2W')).not.toBeNull();
  });

  it('rejects random text', () => {
    expect(parseDuration('7 days')).toBeNull();
  });
});

describe('formatDurationParts', () => {
  it('formats days and hours', () => {
    const parts = parseDuration('P7DT2H')!;
    expect(formatDurationParts(parts)).toBe('7 days, 2 hours');
  });

  it('formats weeks as days', () => {
    const parts = parseDuration('P2W')!;
    expect(formatDurationParts(parts)).toBe('14 days');
  });

  it('handles a single unit with singular label', () => {
    const parts = parseDuration('PT1H')!;
    expect(formatDurationParts(parts)).toBe('1 hour');
  });
});

describe('formatDurationPartsIso', () => {
  it('round-trips a date+time duration', () => {
    const parts = parseDuration('P7DT2H')!;
    expect(formatDurationPartsIso(parts)).toBe('P7DT2H');
  });

  it('round-trips a week-only duration', () => {
    const parts = parseDuration('P2W')!;
    expect(formatDurationPartsIso(parts)).toBe('P2W');
  });

  it('round-trips a week combined with another component (kept consistent)', () => {
    const parts = parseDuration('P1W1D')!;
    expect(formatDurationPartsIso(parts)).toBe('P1W1D');
  });

  it('round-trips a time-only duration', () => {
    const parts = parseDuration('PT2H30M')!;
    expect(formatDurationPartsIso(parts)).toBe('PT2H30M');
  });

  it('normalizes a fractional hour for Duration.from consumption', () => {
    const parts = parseDuration('PT1.5H')!;
    expect(formatDurationPartsIso(parts)).toBe('PT1H30M');
  });

  it('normalizes a fractional minute down to seconds', () => {
    const parts = parseDuration('PT2H30.5M')!;
    expect(formatDurationPartsIso(parts)).toBe('PT2H30M30S');
  });

  it('keeps a fractional second as the smallest unit', () => {
    const parts = parseDuration('PT0.5S')!;
    expect(formatDurationPartsIso(parts)).toBe('PT0.5S');
  });
});

describe('formatDatetimeIso', () => {
  it('formats a full datetime with UTC timezone', () => {
    const parts = parseDatetime('2022-11-11T08:01:20.557+00:00')!;
    expect(formatDatetimeIso(parts)).toBe('2022-11-11T08:01:20.557Z');
  });

  it('formats a local datetime without timezone', () => {
    const parts = parseDatetime('2023-01-18T09:21:00')!;
    expect(formatDatetimeIso(parts)).toBe('2023-01-18T09:21:00');
  });

  it('formats a reduced date', () => {
    const parts = parseReducedDate('2023-01')!;
    expect(formatDatetimeIso(parts)).toBe('2023-01');
  });
});

describe('addDurationToIso', () => {
  it('adds a duration to a local datetime', () => {
    const end = addDurationToIso('2024-01-01T00:00:00', parseDuration('P7DT2H')!);
    expect(end).not.toBeNull();
    expect(end).toMatch(/^2024-01-08T02:00:00/);
  });

  it('handles month-end overflow (calendar-accurate)', () => {
    const end = addDurationToIso('2024-01-31T00:00:00', parseDuration('P1M')!);
    expect(end).toMatch(/^2024-02-29/);
  });

  it('treats a local datetime without a timezone via the Plain path', () => {
    // The date portion contains a dash followed by digits, which must NOT be
    // mistaken for a trailing timezone offset.
    const end = addDurationToIso('2024-01-08T02:00:00', parseDuration('P7DT2H')!);
    expect(end).toMatch(/^2024-01-15T04:00:00/);
  });

  it('handles a datetime with a trailing timezone offset via the Zoned path', () => {
    const end = addDurationToIso('2024-01-01T00:00:00+02:00', parseDuration('P1D')!);
    expect(end).toMatch(/^2024-01-02T00:00:00\+02:00/);
  });

  it('adds a fractional-hour duration (does not throw)', () => {
    const end = addDurationToIso('2024-01-01T00:00:00', parseDuration('PT1.5H')!);
    expect(end).toMatch(/^2024-01-01T01:30:00/);
  });

  it('adds a week combined with days as the total (preview/calculator consistent)', () => {
    // Preview reports weeks*7 + days = 8 days; the arithmetic must agree.
    const end = addDurationToIso('2024-01-01T00:00:00', parseDuration('P1W1D')!);
    expect(end).toMatch(/^2024-01-09T00:00:00/);
  });
});

describe('subtractDurationFromIso', () => {
  it('subtracts a duration from a local datetime', () => {
    const start = subtractDurationFromIso('2024-01-08T02:00:00', parseDuration('P7DT2H')!);
    expect(start).toBe('2024-01-01T00:00:00');
  });

  it('handles month underflow (calendar-accurate)', () => {
    const start = subtractDurationFromIso('2024-03-01T00:00:00', parseDuration('P1D')!);
    expect(start).toBe('2024-02-29T00:00:00');
  });

  it('is the inverse of adding the same duration', () => {
    const start = '2024-06-15T09:30:00';
    const duration = parseDuration('P1Y2M3DT4H5M6S')!;
    const end = addDurationToIso(start, duration)!;
    const backAgain = subtractDurationFromIso(end, duration)!;
    expect(backAgain.startsWith('2024-06-15T09:30:00')).toBe(true);
  });

  it('returns null for an unparseable value', () => {
    expect(subtractDurationFromIso('not-a-date', parseDuration('P1D')!)).toBeNull();
  });

  it('subtracts a fractional-hour duration (does not throw)', () => {
    const start = subtractDurationFromIso('2024-01-01T01:30:00', parseDuration('PT1.5H')!);
    expect(start).toBe('2024-01-01T00:00:00');
  });
});
