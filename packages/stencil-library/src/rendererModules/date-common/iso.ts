/**
 * Pure, dependency-free ISO 8601 parsing and validation helpers shared by the
 * date renderer modules (`DateType`, `ReducedDateType`, `DurationType`).
 *
 * These helpers are intentionally synchronous and lightweight so they can back
 * the synchronous `quickCheck()` in each renderer, which is what auto-detection
 * (and `Parser.getBestFitQuick`) relies on. Authoritative arithmetic/rendering
 * is delegated to Temporal (see `temporal.ts`) once a value has been accepted.
 */

/** Which calendar components are present in a parsed datetime. */
export interface DateTimeParts {
  /** Full `YYYY-MM-DD` when a date is present. */
  date: string;
  /** Year number when a date is present. */
  year: number;
  /** Month number when a month is present, else undefined. */
  month?: number;
  /** Day-of-month when present, else undefined. */
  day?: number;
  /** Full `YYYY` or `YYYY-MM` when a reduced-precision date is present. */
  reducedDate?: string;
  /** `HH:MM:SS(.fff)` time when present. */
  time?: string;
  /** Timezone offset in minutes when present, else undefined (= local time). */
  timezoneOffsetMinutes?: number;
  /** True when a `T` time component is present. */
  hasTime: boolean;
  /** True when the value is a reduced-precision date (YYYY or YYYY-MM). */
  isReduced: boolean;
}

/** Parsed ISO 8601 duration components. */
export interface DurationParts {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True when any `T` time component is present. */
  hasTime: boolean;
}

/**
 * Matches a full calendar date (optionally with a time and timezone).
 * Non-capturing inner groups keep the capture indices predictable:
 *   [1] date  [2] hour  [3] minute  [4] seconds(+fraction)  [5] timezone
 */
const DATETIME_REGEX =
  /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?|60(?:\.\d+)?)(?:([zZ]|[+-]\d{2}(?::?\d{2})?))?)?$/;

/** Matches a reduced-precision date (YYYY or YYYY-MM). [1] year [2] month(-MM). */
const REDUCED_DATE_REGEX = /^(\d{4})(?:-(0[1-9]|1[0-2]))?$/;

/**
 * Matches an ISO 8601 duration (calendar + clock, or week-only form).
 * Calendar components (Y/M/W/D) must be integers (Temporal.Duration only
 * accepts fractional time units), while time components (H/M/S) may carry a
 * fraction. Non-capturing inner groups keep the capture indices predictable:
 *   [1] years  [2] months  [3] weeks  [4] days  [5] hours  [6] minutes  [7] seconds
 */
const DURATION_REGEX =
  /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

/** Day-of-month limits per month, accounting for leap years. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Parses a year-only or year-month ISO date into parts. Returns null when the
 * value is not a valid reduced-precision date.
 */
export function parseReducedDate(value: string): DateTimeParts | null {
  const m = REDUCED_DATE_REGEX.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  if (year < 0 || year > 9999) return null;
  if (!m[2]) {
    return { date: value, year, hasTime: false, isReduced: true };
  }
  const month = Number(m[2]);
  return {
    date: value,
    year,
    month,
    reducedDate: value,
    hasTime: false,
    isReduced: true,
  };
}

/**
 * Parses a full ISO 8601 datetime into parts. Accepts an optional time and an
 * optional timezone. A datetime without a timezone is treated as local time
 * (the `timezoneOffsetMinutes` stays undefined).
 */
export function parseDatetime(value: string): DateTimeParts | null {
  const m = DATETIME_REGEX.exec(value);
  if (!m) return null;

  // Date part is always `YYYY-MM-DD`.
  const dateComponents = m[1].split('-').map(Number);
  const year = dateComponents[0];
  const month = dateComponents[1];
  const day = dateComponents[2];
  if (month < 1 || month > 12) return null;
  // Reject day zero (e.g. `2024-01-00`), which the Date constructor would
  // otherwise normalize to the previous month instead of being invalid.
  if (day < 1 || day > daysInMonth(year, month)) return null;

  const hasTime = m[2] !== undefined;

  let time: string | undefined;
  let timezoneOffsetMinutes: number | undefined;

  if (hasTime) {
    const hour = Number(m[2]);
    const minute = Number(m[3]);
    if (hour > 23 || minute > 59) return null;

    const secondToken = String(m[4]);
    const secNum = Number(secondToken);
    if (secNum > 59) {
      // 60 is only permitted as a leap second at 23:59 UTC.
      if (!(secNum === 60 && hour === 23 && minute === 59)) return null;
    }

    time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${secondToken}`;

    const tz = m[5];
    if (tz !== undefined) {
      if (/^[zZ]$/.test(tz)) {
        timezoneOffsetMinutes = 0;
      } else {
        const sign = tz[0] === '-' ? -1 : 1;
        // The offset may be extended (+02:30) or basic (+0230); normalize the
        // optional colon so both forms parse the minutes identically.
        const raw = tz.slice(1);
        const normalized = raw.includes(':') ? raw : raw.slice(0, 2) + ':' + raw.slice(2);
        const tzHour = Number(normalized.slice(0, 2));
        const tzMinute = Number(normalized.slice(3));
        if (tzHour > 14 || (tzHour === 14 && tzMinute !== 0)) return null;
        // Range-check the minutes so invalid values like `+02:99` are rejected.
        if (tzMinute > 59) return null;
        timezoneOffsetMinutes = sign * (tzHour * 60 + tzMinute);
      }
    }
  }

  return { date: m[1], year, month, day, time, timezoneOffsetMinutes, hasTime, isReduced: false };
}

/**
 * Parses an ISO 8601 duration (e.g. `P7DT2H`, `P2W`, `PT1.5H`) into
 * components. Returns null when the value is not a valid duration.
 */
export function parseDuration(value: string): DurationParts | null {
  const m = DURATION_REGEX.exec(value);
  if (!m) return null;

  const years = m[1] !== undefined ? Number(m[1]) : 0;
  const months = m[2] !== undefined ? Number(m[2]) : 0;
  const weeks = m[3] !== undefined ? Number(m[3]) : 0;
  const days = m[4] !== undefined ? Number(m[4]) : 0;
  const hours = m[5] !== undefined ? Number(m[5]) : 0;
  const minutes = m[6] !== undefined ? Number(m[6]) : 0;
  const seconds = m[7] !== undefined ? Number(m[7]) : 0;

  const hasAny =
    years > 0 || months > 0 || weeks > 0 || days > 0 || hours > 0 || minutes > 0 || seconds > 0;
  if (!hasAny) return null;

  return { years, months, weeks, days, hours, minutes, seconds, hasTime: hours > 0 || minutes > 0 || seconds > 0 };
}
