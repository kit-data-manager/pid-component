import {PIDDataType} from "./PIDDataType";
import {PID} from "./PID";

/**
 * This class represents a PID record.
 * @author Maximilian Inckmann (@maximilianiKIT)
 * @copyright August 2023
 */
export class PIDRecord {

    /**
     * The PID of the record.
     * @private
     */
    private readonly _pid: PID;

    /**
     * The values of the record.
     * @private
     */
    private readonly _values: {
        /**
         * The index of the value in the record.
         */
        index: number,

        /**
         * The type of the value.
         * This can be a PID, a PID data type or a string.
         * If it is a string, it most certainly not a PID.
         * If it is a PID, it couldn't be resolved to a PIDDataType.
         * If it is a PIDDataType, it has additional information that can be showed to the user.
         */
        type: PIDDataType | PID | string,

        /**
         * The data of the value.
         */
        data: {
            /**
             * The format of the data.
             */
            format: string,

            /**
             * The value of the data.
             */
            value: string
        },

        /**
         * The time to live of the value.
         */
        ttl: number,

        /**
         * The timestamp of the value.
         */
        timestamp: number
    }[] = [];

    constructor(pid: PID) {
        this._pid = pid;
    }

    /**
     * Outputs the PID of the record.
     */
    get pid(): PID {
        return this._pid;
    }

    /**
     * Outputs the values of the record.
     */
    get values(): {
        index: number,
        type: string | PID | PIDDataType,
        data: {
            format: string,
            value: string
        },
        ttl: number,
        timestamp: number
    }[] {
        return this._values;
    }

}
