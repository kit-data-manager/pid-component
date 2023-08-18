import {GenericIdentifierType} from "./GenericIdentifierType";
import {HandleType} from "./HandleType";
import {FallbackType} from "./FallbackType";
import {ORCIDType} from "./ORCIDType";
import {DateType} from "./DateType";
import {URLType} from "./URLType";

/**
 * Class that handles the parsing of a given value and returns the best fitting component object
 */
export class Parser {

    /**
     * Array of all component objects that can be used to parse a given value, ordered by priority (lower is better)
     * @private
     */
    static readonly _dataTypes: (new(value: string, settings?: {
        name: string,
        value: any
    }[]) => GenericIdentifierType)[] = [
        DateType,
        ORCIDType,
        HandleType,
        URLType,
        FallbackType,
    ];

    /**
     * Returns the priority of the best fitting component object for a given value (lower is better)
     * @param value String value to parse and evaluate
     */
    static getEstimatedPriority(value: string): number {
        let priority = 0;
        for (let i = 0; i < this._dataTypes.length; i++) {
            const obj = new this._dataTypes[i](value);
            if (obj.hasCorrectFormat()) {
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
    static async getBestFit(value: string, settings: {
        type: string, values: {
            name: string,
            value: any
        }[]
    }[]): Promise<GenericIdentifierType> {
        // default to fallback
        let bestFit = new this._dataTypes[this._dataTypes.length - 1](value)

        // find best fit in _dataTypes array with the highest priority (lowest index has highest priority) and correct format
        for (let i = this._dataTypes.length - 1; i >= 0; i--) {
            const obj = new this._dataTypes[i](value);
            if (obj.hasCorrectFormat()) bestFit = obj;
        }

        // if settings for this type exist, add them to the object
        try {
            const settingsKey = bestFit.getSettingsKey();
            const settingsValues = settings.find((value) => value.type === settingsKey)?.values;
            if (settingsValues) bestFit.settings = settingsValues;
        } catch (_) {
        }

        // initialize and return the object
        await bestFit.init()
        return bestFit
    }
}
