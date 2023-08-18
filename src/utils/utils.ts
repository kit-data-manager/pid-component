import {PID} from "./PID";
import {PIDDataType} from "./PIDDataType";
import {PIDRecord} from "./PIDRecord";
// import {init} from "./DataCache";

/**
 * A cache of all fetched data.
 */
// export const dataCache = await DataCache.init("pid-component");

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
 */
export const unresolvables: Set<PID> = new Set();

export function getLocaleDetail(locale: string, type: "region" | "language"): string {
  const friendlyName = new Intl.DisplayNames(['en'], {type: type}).of(locale.toUpperCase());
  if (type === "language") return friendlyName;

  const codePoints = locale
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  const flag = String.fromCodePoint(...codePoints);
  return `${flag} ${friendlyName}`;
}

// export const dataCache = await init("pid-component")
