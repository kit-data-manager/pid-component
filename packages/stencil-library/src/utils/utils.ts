import { PID } from '../rendererModules/Handle/PID';
import { PIDDataType } from '../rendererModules/Handle/PIDDataType';
import { PIDRecord } from '../rendererModules/Handle/PIDRecord';
import { GenericIdentifierType } from './GenericIdentifierType';
import { DateType } from '../rendererModules/DateType';
import { ORCIDType } from '../rendererModules/ORCiD/ORCIDType';
import { HandleType } from '../rendererModules/Handle/HandleType';
import { DOIType } from '../rendererModules/DOI/DOIType';
import { EmailType } from '../rendererModules/EmailType';
import { URLType } from '../rendererModules/URLType';
import { FallbackType } from '../rendererModules/FallbackType';
import { LocaleType } from '../rendererModules/LocaleType';
import { JSONType } from '../rendererModules/JSONType';
import { RORType } from '../rendererModules/RORType';
import { SPDXType } from '../rendererModules/SPDXType';

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
    key: 'DOIType',
    constructor: DOIType,
  },
  {
    priority: 3,
    key: 'HandleType',
    constructor: HandleType,
  },
  {
    priority: 4,
    key: 'RORType',
    constructor: RORType,
  },
  {
    priority: 5,
    key: 'SPDXType',
    constructor: SPDXType,
  },
  {
    priority: 6,
    key: 'EmailType',
    constructor: EmailType,
  },
  {
    priority: 7,
    key: 'URLType',
    constructor: URLType,
  },
  {
    priority: 8,
    key: 'LocaleType',
    constructor: LocaleType,
  },
  {
    priority: 9,
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
