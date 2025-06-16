import { PID } from '../rendererModules/Handle/PID';
import { PIDDataType } from '../rendererModules/Handle/PIDDataType';
import { PIDRecord } from '../rendererModules/Handle/PIDRecord';
import { GenericIdentifierType } from './GenericIdentifierType';
import { DateType } from '../rendererModules/DateType';
import { ORCIDType } from '../rendererModules/ORCiD/ORCIDType';
import { HandleType } from '../rendererModules/Handle/HandleType';
import { EmailType } from '../rendererModules/EmailType';
import { URLType } from '../rendererModules/URLType';
import { FallbackType } from '../rendererModules/FallbackType';
import { LocaleType } from '../rendererModules/LocaleType';
import { JSONType } from '../rendererModules/JSONType';
import { RORType } from '../rendererModules/RORType';

/**
 * Array of all component objects that can be used to parse a given value, ordered by priority (lower is better)
 * @type {Array<{priority: number, key: string, constructor: GenericIdentifierType}>}
 */
export const renderers: {
  priority: number;
  key: string;
  constructor: new (value: string, settings?: { name: string; value: unknown }[]) => GenericIdentifierType;
}[] = [
  {
    priority: 0,
    key: 'DateType',
    constructor: DateType,
  },
  {
    priority: 1,
    key: 'ORCIDType',
    constructor: ORCIDType,
  },
  {
    priority: 2,
    key: 'HandleType',
    constructor: HandleType,
  },
  {
    priority: 3,
    key: 'RORType',
    constructor: RORType,
  },
  {
    priority: 4,
    key: 'EmailType',
    constructor: EmailType,
  },
  {
    priority: 5,
    key: 'URLType',
    constructor: URLType,
  },
  {
    priority: 6,
    key: 'LocaleType',
    constructor: LocaleType,
  },
  {
    priority: 7,
    key: 'JSONType',
    constructor: JSONType,
  },
  {
    priority: 99,
    key: 'FallbackType',
    constructor: FallbackType,
  },
];

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
