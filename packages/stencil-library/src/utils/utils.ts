import { PIDDataType } from '../rendererModules/Handle/PIDDataType';
import { PIDRecord } from '../rendererModules/Handle/PIDRecord';
import { GenericIdentifierType } from './GenericIdentifierType';
import { ORCIDType } from '../rendererModules/ORCiD/ORCIDType';
import { HandleType } from '../rendererModules/Handle/HandleType';
import { DataCiteDOIType } from '../rendererModules/DOI/DataCite/DataCiteDOIType';
import { CrossRefDOIType } from '../rendererModules/DOI/CrossRef/CrossRefDOIType';
import { DateType } from '../rendererModules/DateType/DateType';
import { ReducedDateType } from '../rendererModules/ReducedDateType/ReducedDateType';
import { DurationType } from '../rendererModules/DurationType/DurationType';
import { RORType } from '../rendererModules/RORType/RORType';
import { SPDXType } from '../rendererModules/SPDXType/SPDXType';
import { EmailType } from '../rendererModules/EmailType/EmailType';
import { URLType } from '../rendererModules/URLType/URLType';
import { LocaleType } from '../rendererModules/LocaleType/LocaleType';
import { JSONType } from '../rendererModules/JSONType/JSONType';
import { FallbackType } from '../rendererModules/FallbackType/FallbackType';
import { ISBNType } from '../rendererModules/ISBNType/ISBNType';

/**
 * Array of all component objects that can be used to parse a given value, ordered by priority (lower is better).
 *
 * Each entry has an `autoDiscoverableByDefault` flag that controls whether the
 * renderer participates in auto-detection (`initPidDetection`) when no explicit
 * `renderers` list is provided. Renderers with `autoDiscoverableByDefault: false`
 * are only used during auto-detection if they are explicitly listed in the config's
 * `renderers` array. This flag does not affect direct '<pid-component>' usage.
 *
 * @type {Array<{ priority: number; key: string; constructor: new (value: string, settings?: { name: string; value: unknown }[]) => GenericIdentifierType; autoDiscoverableByDefault: boolean }>}
 */
export const renderers: {
  priority: number;
  key: string;
  constructor: new (value: string, settings?: { name: string; value: unknown }[]) => GenericIdentifierType;
  /** Whether this renderer is active during auto-detection when no explicit renderer list is provided. */
  autoDiscoverableByDefault: boolean;
}[] = [
  {
    priority: 0,
    key: 'DurationType',
    constructor: DurationType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 1,
    key: 'DateType',
    constructor: DateType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 2,
    key: 'ReducedDateType',
    constructor: ReducedDateType,
    autoDiscoverableByDefault: false,
  },
  {
    priority: 3,
    key: 'ORCIDType',
    constructor: ORCIDType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 4,
    key: 'DataCiteDOIType',
    constructor: DataCiteDOIType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 4,
    key: 'CrossRefDOIType',
    constructor: CrossRefDOIType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 5,
    key: 'HandleType',
    constructor: HandleType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 6,
    key: 'RORType',
    constructor: RORType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 7,
    key: 'SPDXType',
    constructor: SPDXType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 8,
    key: 'ISBNType',
    constructor: ISBNType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 9,
    key: 'EmailType',
    constructor: EmailType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 10,
    key: 'URLType',
    constructor: URLType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 11,
    key: 'LocaleType',
    constructor: LocaleType,
    autoDiscoverableByDefault: false,
  },
  {
    priority: 12,
    key: 'JSONType',
    constructor: JSONType,
    autoDiscoverableByDefault: true,
  },
  {
    priority: 99,
    key: 'FallbackType',
    constructor: FallbackType,
    autoDiscoverableByDefault: false,
  },
];

/**
 * A map of all PID data types and their PIDs.
 * Uses PID string representation as keys for reliable lookup.
 * @type {Map<string, PIDDataType>}
 */
export const typeMap: Map<string, PIDDataType> = new Map();

/**
 * A map of all PIDs and their PIDRecords.
 * Uses PID string representation as keys for reliable lookup.
 * @type {Map<string, PIDRecord>}
 */
export const handleMap: Map<string, PIDRecord> = new Map();

/**
 * A set of all PIDs that are not resolvable.
 * Uses PID string representation for reliable lookup.
 * @type {Set<string>}
 */
export const unresolvables: Set<string> = new Set();
