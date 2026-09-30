/**
 * Pure date/value helpers for the duration-calculator component, kept free of
 * any `@stencil/core` import so they can be unit-tested directly.
 */

/** Normalizes a datetime-local input value into a parseable ISO local datetime. */
export function toIsoInput(value: string): string {
  // A datetime-local value of the form YYYY-MM-DDTHH:MM has no seconds.
  return value.length === 16 ? value + ':00' : value;
}

/**
 * Formats a computed ISO local datetime for display in a datetime-local input.
 * Preserves fractional seconds; only drops a trailing ':00' seconds component
 * (or ':00.000') when it is exactly zero, so minute-level values read cleanly
 * and nonzero fractional seconds are not lost.
 */
export function toInputValue(iso: string): string {
  return iso.replace(/:00(\.0+)?$/, '');
}

/** Formats a Date as a datetime-local input value (YYYY-MM-DDTHH:MM, local time). */
export function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
