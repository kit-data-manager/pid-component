import { PID } from './PID';
import { PIDDataType } from './PIDDataType';
import { PIDRecord } from './PIDRecord';

/**
 * A map of all PID data types and their PIDs.
 * @type {Map<PID, PIDDataType>}
 */
export const typeMap: Map<PID, PIDDataType> = new Map();

/**
 * A map of all PIDs and their PIDRecords.
 * @type {Map<PID, PIDRecord>}
 */
export const handleMap: Map<PID, PIDRecord> = new Map();

/**
 * A set of all PIDs that are not resolvable.
 * @type {Set<PID>}
 */
export const unresolvables: Set<PID> = new Set();

/**
 * Returns a user-friendly name of a locale.
 * If the locale is a language, it will return the name of the language.
 * If the locale is a region, it will return the flag of the region and the name of the region.
 * @param locale The locale to get the name of.
 * @param type The type of the locale.Either 'region' or 'language'.
 * @returns {string} The user-friendly name of the locale.
 */
export function getLocaleDetail(locale: string, type: 'region' | 'language'): string {
  const friendlyName = new Intl.DisplayNames(['en'], { type: type }).of(locale.toUpperCase());
  if (type === 'language') return friendlyName;

  const codePoints = locale
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  const flag = String.fromCodePoint(...codePoints);
  return `${flag} ${friendlyName}`;
}
