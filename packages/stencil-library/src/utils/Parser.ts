import { GenericIdentifierType } from './GenericIdentifierType';
import { renderers } from './utils';

/**
 * Class that handles the parsing of a given value and returns the best fitting component object
 */
export class Parser {
  /**
   * Returns the priority of the best fitting component object for a given value (lower is better)
   * @param value String value to parse and evaluate
   * @returns {number} The priority of the best fitting component object for a given value (lower is better)
   */
  static async getEstimatedPriority(value: string): Promise<number> {
    let priority = 0;
    for (let i = 0; i < renderers.length; i++) {
      const obj = new renderers[i].constructor(value);
      if (await obj.hasCorrectFormat()) {
        priority = i;
        break;
      }
    }
    return priority;
  }

  /**
   * Returns the best fitting component object for a given value
   * @param value String value to parse and evaluate
   * @param settings Settings of the environment from which the settings for the component are extracted
   * @returns {Promise<GenericIdentifierType>} The best fitting component object
   */
  static async getBestFit(
    value: string,
    settings: {
      type: string;
      values: {
        name: string;
        value: unknown;
      }[];
    }[],
  ): Promise<GenericIdentifierType> {
    // default to fallback
    let bestFit = new renderers[renderers.length - 1].constructor(value);

    // find best fit in _dataTypes array with the highest priority (lowest index has highest priority) and correct format
    for (let i = renderers.length - 1; i >= 0; i--) {
      const obj = new renderers[i].constructor(value);
      if (await obj.hasCorrectFormat()) bestFit = obj;
    }

    // if settings for this type exist, add them to the object
    try {
      const settingsKey = bestFit.getSettingsKey();
      const settingsValues = settings.find(value => value.type === settingsKey)?.values;
      if (settingsValues) bestFit.settings = settingsValues;
    } catch (e) {
      console.warn('Error while adding settings to object:', e);
    }

    // initialize and return the object
    await bestFit.init();
    return bestFit;
  }
}
