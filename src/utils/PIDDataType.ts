import {locationType, PID} from "./PID";
import {typeMap, unresolvables} from "./utils";

/**
 * This class represents a PID data type.
 */
export class PIDDataType {
    /**
     * The PID of the data type.
     * @private
     */
    private readonly _pid: PID;

    /**
     * The name of the data type.
     * @private
     */
    private readonly _name: string;

    /**
     * The description of the data type.
     * @private
     */
    private readonly _description: string;

    /**
     * The redirect URL of a user-friendly website.
     * @private
     */
    private readonly _redirectURL: string;

    /**
     * The raw JSON object from the ePIC data type registry.
     * @private
     */
    private readonly _ePICJSON: object;

    /**
     * An optional regex to check if a value matches this data type.
     * @private
     */
    private readonly _regex?: RegExp;

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
     */
    get pid(): PID {
        return this._pid;
    }

    /**
     * Outputs the name of the data type.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Outputs the description of the data type.
     */
    get description(): string {
        return this._description;
    }

    /**
     * Outputs the redirect URL of the data type.
     */
    get redirectURL(): string {
        return this._redirectURL;
    }

    /**
     * Outputs the raw JSON object from the ePIC data type registry.
     */
    get ePICJSON(): object {
        return this._ePICJSON;
    }

    /**
     * Outputs the optional regex of the data type.
     */
    get regex(): RegExp {
        return this._regex;
    }

    /**
     * Tries to resolve a PID to a PIDDataType object.
     * @return Promise<PIDDataType | undefined>
     *     The PIDDataType object if the PID could be resolved, undefined otherwise.
     * @param pid
     */
    public static async resolveDataType(pid: PID): Promise<PIDDataType | undefined> {
        // Check if PID is already resolved
        if (typeMap.has(pid)) return typeMap.get(pid);

        // Check if PID is resolvable
        if (!pid.isResolvable()) {
            console.log(`PID ${pid.toString()} is not resolvable`);
            return undefined;
        }

        // Resolve PID and make sure it isn't undefined
        const pidRecord = await pid.resolve()
        if (pidRecord === undefined) {
            console.log(`PID ${pid.toString()} could not be resolved`);
            unresolvables.add(pid);
            return undefined;
        }

        // Create a temporary object to store the information
        let tempDataType: {
            name: string,
            description: string,
            regex?: RegExp,
            redirectURL: string,
            ePICJSON: object
        } = {name: "", description: "", redirectURL: "", ePICJSON: {}};

        // Check if there is a reference to a ePIC instance via a 10320/Loc type and resolve it
        for (let i = 0; i < pidRecord.values.length; i++) {
            const currentValue = pidRecord.values[i];
            if (currentValue.type === locationType || currentValue.type.toString() === locationType.toString()) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(currentValue.data.value as string, "text/xml");
                // Get all locations from the XML specified in 10320/loc
                const xmlLocations = xmlDoc.getElementsByTagName("location");
                for (let j = 0; j < xmlLocations.length; j++) {
                    // Extract link
                    let newLocation = {
                        href: xmlLocations[j].getAttribute("href"),
                        weight: undefined,
                        view: undefined,
                        resolvedData: undefined
                    }

                    // Extract weight
                    try {
                        newLocation.weight = parseInt(xmlLocations[j].getAttribute("weight"))
                    } catch (ignored) {
                    }

                    // Extract view e.g. json or html
                    try {
                        newLocation.view = xmlLocations[j].getAttribute("view")
                    } catch (ignored) {
                    }

                    // Try to resolve the data from the link
                    try {
                        if (newLocation.view === "json") {
                            // if view is json then fetch the data from the link (ePIC data type registry) and save them into the temp object
                            const res = await fetch(newLocation.href);
                            newLocation.resolvedData = await res.json();
                            tempDataType.ePICJSON = newLocation.resolvedData;
                            tempDataType.name = newLocation.resolvedData["name"];
                            tempDataType.description = newLocation.resolvedData["description"];
                        } else {
                            // if view is html set the redirect URL (activated on user click) to the link
                            tempDataType.redirectURL = newLocation.href;
                        }
                    } catch (ignored) {
                    }
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
