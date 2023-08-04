import {PID} from "./PID";
import {PIDDataType} from "./PIDDataType";
import {PIDRecord} from "./PIDRecord";

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
