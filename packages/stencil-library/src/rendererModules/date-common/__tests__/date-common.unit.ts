import { describe, expect, it } from 'vitest';
import { parseDatetime, parseDuration, parseReducedDate } from '../iso';
import { addDurationToIso, formatDurationParts, formatDurationPartsIso, formatDatetimeIso } from '../format';

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

  it('parses a time-only duration', () => {
    const parts = parseDuration('PT2H30M')!;
    expect(parts.hours).toBe(2);
    expect(parts.minutes).toBe(30);
  });

  it('rejects an empty duration marker', () => {
    expect(parseDuration('P')).toBeNull();
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
});
