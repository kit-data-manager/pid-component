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
  constructor(pid: PID);

  constructor(pid: PID, values: {
    index: number;
    type: string | PID | PIDDataType;
    data: {
      format: string;
      value: string
    };
    ttl: number;
    timestamp: number
  }[]);

  constructor(pid: PID, values?: {
    index: number;
    type: string | PID | PIDDataType;
    data: {
      format: string;
      value: string;
    };
    ttl: number;
    timestamp: number;
  }[]) {
    this._pid = pid;
    this._values = values;
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

  toObject() {
    return {
      pid: JSON.stringify(this._pid.toObject()),
      values: this._values.map(value => (JSON.stringify({
        index: value.index,
        type: JSON.stringify({
          pid: value.type instanceof PID ? JSON.stringify(value.type.toObject()) : undefined,
          pidDataType: value.type instanceof PIDDataType ? JSON.stringify(value.type.toObject()) : undefined,
          string: typeof value.type == 'string' ? value.type : undefined,
        }),
        data: JSON.stringify(value.data),
        ttl: value.ttl,
        timestamp: value.timestamp,
      }))),
    };
  }

  static fromJSON(serialized: string): PIDRecord {
    const data: ReturnType<PIDRecord['toObject']> = JSON.parse(serialized);

    const values: {
      index: number;
      type: string | PID | PIDDataType;
      data: {
        format: string;
        value: string;
      };
      ttl: number;
      timestamp: number;
    }[] = data.values.map(value => {
      const parsed: {
        index: number;
        type: string;
        data: string;
        ttl: number;
        timestamp: number;
      } = JSON.parse(value);

      const parsedType = JSON.parse(parsed.type);
      let type: PIDDataType | PID | string;
      if (parsedType.pidDataType !== undefined) {
        type = PIDDataType.fromJSON(parsedType.pidDataType);
      } else if (parsedType.pid !== undefined) {
        type = PID.fromJSON(parsedType.pid);
      } else {
        type = parsedType.string as string;
      }

      const data: {
        format: string;
        value: string;
      } = JSON.parse(parsed.data);

      return (
        {
          index: parsed.index,
          type: type,
          data: data,
          ttl: parsed.ttl,
          timestamp: parsed.timestamp,
        });
    });
    return new PIDRecord(PID.fromJSON(data.pid), values);
  }
}
