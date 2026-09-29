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

/** Matches a full calendar date with time (timezone optional). */
const DATETIME_REGEX =
  /^(?<year>[0-9]{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12][0-9]|3[01])(T(?<hour>[01][0-9]|2[0-3]):(?<minute>[0-5][0-9]):(?<second>[0-5][0-9]|60)(?<fraction>\.\d+)?(?<tz>[zZ]|[+-]([01][0-9]|2[0-3]):?[0-5][0-9])?)?$/;

/** Matches a reduced-precision date (YYYY or YYYY-MM). */
const REDUCED_DATE_REGEX = /^(?<year>[0-9]{4})(?<month>-0[1-9]|-1[0-2])?$/;

/** Matches an ISO 8601 duration (calendar + clock, or week-only form). */
const DURATION_REGEX =
  /^P(?:(?<years>\d+(?:\.\d+)?)Y)?(?:(?<months>\d+(?:\.\d+)?)M)?(?:(?<weeks>\d+(?:\.\d+)?)W)?(?:(?<days>\d+(?:\.\d+)?)D)?(?:T(?:(?<hours>\d+(?:\.\d+)?)H)?(?:(?<minutes>\d+(?:\.\d+)?)M)?(?:(?<seconds>\d+(?:\.\d+)?)S)?)?$/;

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
  if (!m || !m.groups) return null;
  const { year: gYear, month: gMonth } = m.groups;
  const year = Number(gYear);
  if (year < 0 || year > 9999) return null;
  if (!gMonth) {
    return { date: value, year, hasTime: false, isReduced: true };
  }
  const month = Number(gMonth.slice(1));
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
  if (!m || !m.groups) return null;
  const g = m.groups;

  const year = Number(g.year);
  const month = Number(g.month);
  const day = Number(g.day);
  if (year < 0 || year > 9999) return null;
  if (day > daysInMonth(year, month)) return null;

  const hasTime = g.hour !== undefined;

  let time: string | undefined;
  let timezoneOffsetMinutes: number | undefined;

  if (hasTime) {
    const hour = Number(g.hour);
    const minute = Number(g.minute);
    let second: number;
    if (g.second === '60') {
      if (!(hour === 23 && minute === 59)) return null;
      second = 60;
    } else {
      second = Number(g.second);
    }

    const frac = g.fraction ?? '';
    time = `${g.hour}:${g.minute}:${g.second}${frac}`;

    const tz = g.tz;
    if (tz !== undefined) {
      if (/^[zZ]$/.test(tz)) {
        timezoneOffsetMinutes = 0;
      } else {
        const sign = tz[0] === '-' ? -1 : 1;
        const tzBody = tz.slice(1);
        const tzHour = Number(tzBody.slice(0, 2));
        const tzMinute = tzBody.length > 2 ? Number(tzBody.slice(3)) : 0;
        if (tzHour > 14 || (tzHour === 14 && tzMinute !== 0)) return null;
        timezoneOffsetMinutes = sign * (tzHour * 60 + tzMinute);
      }
    }
  }

  const date = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return { date, year, month, day, time, timezoneOffsetMinutes, hasTime, isReduced: false };
}

/**
 * Parses an ISO 8601 duration (e.g. `P7DT2H`, `P2W`, `PT1.5H`) into
 * components. Returns null when the value is not a valid duration.
 */
export function parseDuration(value: string): DurationParts | null {
  const m = DURATION_REGEX.exec(value);
  if (!m || !m.groups) return null;
  const g = m.groups;

  const years = g.years !== undefined ? Number(g.years) : 0;
  const months = g.months !== undefined ? Number(g.months) : 0;
  const weeks = g.weeks !== undefined ? Number(g.weeks) : 0;
  const days = g.days !== undefined ? Number(g.days) : 0;
  const hours = g.hours !== undefined ? Number(g.hours) : 0;
  const minutes = g.minutes !== undefined ? Number(g.minutes) : 0;
  const seconds = g.seconds !== undefined ? Number(g.seconds) : 0;

  const hasAny =
    years > 0 || months > 0 || weeks > 0 || days > 0 || hours > 0 || minutes > 0 || seconds > 0;
  if (!hasAny) return null;

  return { years, months, weeks, days, hours, minutes, seconds, hasTime: hours > 0 || minutes > 0 || seconds > 0 };
}
