import { locationType, PID } from './PID';
import { typeMap, unresolvables } from './utils';
import { init } from './DataCache';

/**
 * This class represents a PID data type.
 */
export class PIDDataType {
  /**
   * The PID of the data type.
   * @private
   * @type {PID}
   */
  private readonly _pid: PID;

  /**
   * The name of the data type.
   * @private
   * @type {string}
   */
  private readonly _name: string;

  /**
   * The description of the data type.
   * @private
   * @type {string}
   */
  private readonly _description: string;

  /**
   * The redirect URL of a user-friendly website.
   * @private
   * @type {string}
   */
  private readonly _redirectURL: string;

  /**
   * The raw JSON object from the ePIC data type registry.
   * @private
   * @type {object}
   */
  private readonly _ePICJSON: object;

  /**
   * An optional regex to check if a value matches this data type.
   * @private
   * @type {RegExp}
   */
  private readonly _regex?: RegExp;

  /**
   * Creates a new PIDDataType object.
   * @param pid The PID of the data type.
   * @param name The name of the data type.
   * @param description The description of the data type.
   * @param redirectURL The redirect URL of a user-friendly website.
   * @param ePICJSON The raw JSON object from the ePIC data type registry.
   * @param regex An optional regex to check if a value matches this data type.
   * @constructor
   */
  constructor(pid: PID, name: string, description: string, redirectURL: string, ePICJSON: Object, regex?: RegExp) {
    this._pid = pid;
    this._name = name;
    this._description = description;
    this._regex = regex;
    this._redirectURL = redirectURL;
    this._ePICJSON = ePICJSON;
  }

  /**
   * Outputs the PID of the data type.
   * @returns {PID} The PID of the data type.
   */
  get pid(): PID {
    return this._pid;
  }

  /**
   * Outputs the name of the data type.
   * @returns {string} The name of the data type.
   */
  get name(): string {
    return this._name;
  }

  /**
   * Outputs the description of the data type.
   * @returns {string} The description of the data type.
   */
  get description(): string {
    return this._description;
  }

  /**
   * Outputs the redirect URL of the data type.
   * @returns {string} The redirect URL of the data type.
   */
  get redirectURL(): string {
    return this._redirectURL;
  }

  /**
   * Outputs the raw JSON object from the ePIC data type registry.
   * @returns {object} The raw JSON object from the ePIC data type registry.
   */
  get ePICJSON(): object {
    return this._ePICJSON;
  }

  /**
   * Outputs the optional regex of the data type.
   * @returns {RegExp} The optional regex of the data type.
   */
  get regex(): RegExp {
    return this._regex;
  }

  /**
   * Tries to resolve a PID to a PIDDataType object.
   * @return Promise<PIDDataType|undefined> The PIDDataType object if the PID could be resolved, undefined otherwise.
   * @param pid
   */
  public static async resolveDataType(pid: PID): Promise<PIDDataType | undefined> {
    // Check if PID is already resolved
    if (typeMap.has(pid)) return typeMap.get(pid);

    // Check if PID is resolvable
    if (!pid.isResolvable()) {
      console.debug(`PID ${pid.toString()} is not resolvable`);
      return undefined;
    }

    // Resolve PID and make sure it isn't undefined
    const pidRecord = await pid.resolve();
    if (pidRecord === undefined) {
      console.debug(`PID ${pid.toString()} could not be resolved`);
      unresolvables.add(pid);
      return undefined;
    }

    // Create a temporary object to store the information
    let tempDataType: {
      name: string;
      description: string;
      regex?: RegExp;
      redirectURL: string;
      ePICJSON: object;
    } = { name: '', description: '', redirectURL: '', ePICJSON: {} };

    // Check if there is a reference to a ePIC instance via a 10320/Loc type and resolve it
    for (let i = 0; i < pidRecord.values.length; i++) {
      const currentValue = pidRecord.values[i];
      if (currentValue.type === locationType || currentValue.type.toString() === locationType.toString()) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(currentValue.data.value as string, 'text/xml');
        // Get all locations from the XML specified in 10320/loc
        const xmlLocations = xmlDoc.getElementsByTagName('location');
        for (let j = 0; j < xmlLocations.length; j++) {
          // Extract link
          let newLocation = {
            href: xmlLocations[j].getAttribute('href'),
            weight: undefined,
            view: undefined,
            resolvedData: undefined,
          };

          // Extract weight
          try {
            newLocation.weight = parseInt(xmlLocations[j].getAttribute('weight'));
          } catch (ignored) {}

          // Extract view e.g. json or html
          try {
            newLocation.view = xmlLocations[j].getAttribute('view');
          } catch (ignored) {}

          // Try to resolve the data from the link
          try {
            if (newLocation.view === 'json') {
              const dataCache = await init('pid-component');
              // if view is json then fetch the data from the link (ePIC data type registry) and save them into the temp object
              const res = await dataCache.fetch(newLocation.href);

              newLocation.resolvedData = res;
              tempDataType.ePICJSON = newLocation.resolvedData;
              tempDataType.name = newLocation.resolvedData['name'];
              tempDataType.description = newLocation.resolvedData['description'];
            } else {
              // if view is html set the redirect URL (activated on user click) to the link
              tempDataType.redirectURL = newLocation.href;
            }
          } catch (ignored) {}
        }
      }
    }

    // Create a new PIDDataType object from the temp object
    try {
      const type = new PIDDataType(pid, tempDataType.name, tempDataType.description, tempDataType.redirectURL, tempDataType.ePICJSON, tempDataType.regex);
      typeMap.set(pid, type);
      return type;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}
