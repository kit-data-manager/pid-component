import { PIDDataType } from './PIDDataType';
import { PID } from './PID';

/**
 * This class represents a PID record.
 */
export class PIDRecord {
  /**
   * The PID of the record.
   * @type {PID}
   * @private
   */
  private readonly _pid: PID;

  /**
   * The values of the record.
   * @type {{
   * index: number,
   * type: PIDDataType | PID | string,
   * data: {
   * format: string,
   * value: string
   * },
   * ttl: number,
   * timestamp: number
   * }[]}
   * @private
   * @default []
   */
  private readonly _values: {
    /**
     * The index of the value in the record.
     * @type {number}
     */
    index: number;

    /**
     * The type of the value.
     * This can be a PID, a PID data type or a string.
     * If it is a string, it is most certainly not a PID.
     * If it is a PID, it couldn't be resolved to a PIDDataType.
     * If it is a PIDDataType, it has additional information that can be shown to the user.
     * @type {PIDDataType | PID | string}
     */
    type: PIDDataType | PID | string;

    /**
     * The data of the value.
     * @type {{
     * format: string,
     * value: string
     * }}
     */
    data: {
      /**
       * The format of the data.
       * @type {string}
       */
      format: string;

      /**
       * The value of the data.
       * @type {string}
       */
      value: string;
    };

    /**
     * The time to live of the value.
     * @type {number}
     */
    ttl: number;

    /**
     * The timestamp of the value.
     * @type {number}
     */
    timestamp: number;
  }[] = [];

  /**
   * The constructor of PIDRecord.
   * @param pid The PID of the record.
   * @constructor
   */
  constructor(pid: PID) {
    this._pid = pid;
  }

  /**
   * Outputs the PID of the record.
   * @returns {PID} The PID of the record.
   */
  get pid(): PID {
    return this._pid;
  }

  /**
   * Outputs the values of the record.
   * @returns {{
   * index: number,
   * type: PIDDataType | PID | string,
   * data: {
   * format: string,
   * value: string
   * },
   * ttl: number,
   * timestamp: number
   * }[]} The values of the record.
   */
  get values(): {
    index: number;
    type: string | PID | PIDDataType;
    data: {
      format: string;
      value: string;
    };
    ttl: number;
    timestamp: number;
  }[] {
    return this._values;
  }
}
