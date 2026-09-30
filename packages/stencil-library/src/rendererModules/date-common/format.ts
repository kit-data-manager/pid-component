import { DateTimeParts, DurationParts } from './iso';
import { Temporal } from './temporal';

/**
 * Formatting and arithmetic helpers for the date renderer modules.
 */

/**
 * Humanized display for a parsed duration, e.g. `P7DT2H` -> "7 days, 2 hours".
 */
export function formatDurationParts(parts: DurationParts): string {
  const segments: string[] = [];
  const push = (value: number, singular: string, plural: string) => {
    if (value > 0) segments.push(`${value} ${value === 1 ? singular : plural}`);
  };
  // Weeks are converted to days so the total is unambiguous.
  const totalDays = parts.days + parts.weeks * 7;
  push(parts.years, 'year', 'years');
  push(parts.months, 'month', 'months');
  push(totalDays, 'day', 'days');
  push(parts.hours, 'hour', 'hours');
  push(parts.minutes, 'minute', 'minutes');
  push(parts.seconds, 'second', 'seconds');
  if (segments.length === 0) return '0 seconds';
  return segments.join(', ');
}

/**
 * The ISO 8601 duration notation for a parsed duration (normalized back to
 * string form), used for display and tooltips.
 */
export function formatDurationPartsIso(parts: DurationParts): string {
  // ISO 8601's week form (PnW) is exclusive: weeks cannot be combined with any
  // other component. A week-only duration round-trips as PnW.
  if (parts.weeks > 0) {
    return `P${parts.weeks}W`;
  }
  const datePart =
    `${parts.years > 0 ? parts.years + 'Y' : ''}` +
    `${parts.months > 0 ? parts.months + 'M' : ''}` +
    `${parts.days > 0 ? parts.days + 'D' : ''}`;
  const timePart =
    `${parts.hours > 0 ? parts.hours + 'H' : ''}` +
    `${parts.minutes > 0 ? parts.minutes + 'M' : ''}` +
    `${parts.seconds > 0 ? parts.seconds + 'S' : ''}`;
  return `P${datePart}${timePart.length > 0 ? 'T' + timePart : ''}`;
}

/**
 * ISO 8601 string for a datetime, preserving reduced precision when present.
 */
export function formatDatetimeIso(parts: DateTimeParts): string {
  if (parts.isReduced) {
    return parts.reducedDate ?? parts.date;
  }
  let out = parts.date;
  if (parts.hasTime && parts.time) {
    out += 'T' + parts.time;
    if (parts.timezoneOffsetMinutes !== undefined) {
      if (parts.timezoneOffsetMinutes === 0) {
        out += 'Z';
      } else {
        const sign = parts.timezoneOffsetMinutes < 0 ? '-' : '+';
        const abs = Math.abs(parts.timezoneOffsetMinutes);
        const h = Math.floor(abs / 60);
        const min = abs % 60;
        out += `${sign}${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      }
    }
  }
  return out;
}

/**
 * Calculates the end datetime for a start datetime plus a duration, using
 * calendar-accurate Temporal arithmetic.
 *
 * @param startIso ISO 8601 datetime string (may be local, without timezone).
 * @param duration The parsed duration to add.
 * @returns The end datetime as an ISO string, or null if the start cannot be
 *          parsed.
 */
export function addDurationToIso(startIso: string, duration: DurationParts): string | null {
  return applyDurationToIso(startIso, duration, 1);
}

/**
 * Calculates the start datetime for an end datetime minus a duration, using
 * calendar-accurate Temporal arithmetic.
 *
 * @param endIso ISO 8601 datetime string (may be local, without timezone).
 * @param duration The parsed duration to subtract.
 * @returns The start datetime as an ISO string, or null if the end cannot be
 *          parsed.
 */
export function subtractDurationFromIso(endIso: string, duration: DurationParts): string | null {
  return applyDurationToIso(endIso, duration, -1);
}

/** Shared add/subtract arithmetic; sign is +1 to add, -1 to subtract. */
function applyDurationToIso(valueIso: string, duration: DurationParts, sign: 1 | -1): string | null {
  try {
    const durationObj = new Temporal.Duration(
      duration.years,
      duration.months,
      duration.weeks,
      duration.days,
      duration.hours,
      duration.minutes,
      duration.seconds,
    );
    // Subtract is implemented as adding the negated duration.
    const effective = sign === 1 ? durationObj : durationObj.negated();

    // Determine whether the value has a trailing timezone designator (an ISO
    // string that ends in Z or ±HH(:MM)). A datetime-local value never has one.
    const TZ_SUFFIX = /[zZ]|[+-]\d{2}(?::?\d{2})$/;
    if (Temporal.ZonedDateTime !== undefined && TZ_SUFFIX.test(valueIso)) {
      const absolute = Temporal.Instant.from(valueIso);
      const offset = extractTrailingOffset(valueIso);
      // `ZonedDateTime.from()` requires a bracketed IANA time zone ID; a fixed
      // offset is applied via `toZonedDateTimeISO(offset)` instead.
      const zoned = absolute.toZonedDateTimeISO(offset).add(effective).toString();
      // `ZonedDateTime.toString()` appends a bracketed time zone ID, so strip it
      // to return plain ISO 8601 with the offset preserved.
      return zoned.replace(/\[[^\]]*\]$/, '');
    }

    const plain = Temporal.PlainDateTime.from(valueIso);
    return plain.add(effective).toString();
  } catch {
    return null;
  }
}

/** Extracts the trailing UTC offset (e.g. '+02:00', '-05:00', or 'Z') from an ISO string. */
function extractTrailingOffset(iso: string): string {
  const tail = iso.slice(iso.indexOf('T') + 1);
  const match = /([zZ]|[+-]\d{2}(?::?\d{2})?)$/.exec(tail);
  if (!match) return 'UTC';
  const offset = match[1];
  return offset === 'Z' ? 'UTC' : offset;
}
