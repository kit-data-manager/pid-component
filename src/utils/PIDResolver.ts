export let handleMap: Map<PID, PIDRecord> = new Map();
export let unresolvables: Set<PID> = new Set();

export class PID {
  private readonly _prefix: string;
  private readonly _suffix: string;

  constructor(prefix: string, suffix: string) {
    this._prefix = prefix;
    this._suffix = suffix;
  }

  get prefix(): string {
    return this._prefix;
  }

  get suffix(): string {
    return this._suffix;
  }

  toString(): string {
    return `${this.prefix}/${this.suffix}`;
  }

  public static async generateColor(text: string): Promise<HSLColor> {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // convert bytes to hex string

    const hue: number = parseInt(hashHex, 16) % 360;
    const lum: number = parseInt(hashHex, 16) % 50;
    return new HSLColor(hue, 70, 30 + lum);
  }

  public static isPID(pid: string): boolean {
    return pid.match("^([0-9,A-Z,a-z])+(\.([0-9,A-Z,a-z])+)*\/([!-~])+$") !== null;
  }

  public static getPIDFromString(pid: string): PID {
    const pidSplit = pid.split("/");
    return new PID(pidSplit[0], pidSplit[1]);
  }

  public async resolve(): Promise<PIDRecord | undefined> {
    if (unresolvables.has(this)) return undefined;
    else if (handleMap.has(this)) return handleMap.get(this);
    else {
      console.log(`Resolving PID ${this.toString()}`);
      const raw = await fetch(`https://hdl.handle.net/api/handles/${this.prefix}/${this.suffix}#resolve`);
      if (raw.status !== 200) {
        console.error(`PID ${this.toString()} probably doesn't exist`);
        unresolvables.add(this);
        return undefined;
      }
      const rawJson = await raw.json();
      const record = new PIDRecord(this);
      for (let value of rawJson.values) {
        const type = (PID.isPID(value.type)) ? PID.getPIDFromString(value.type) : value.type;
        // if (type instanceof PID && !unresolvables.has(type)) await type.resolve();
        record.values.push({
          index: value.index,
          type: type,
          data: value.data,
          ttl: value.ttl,
          timestamp: Date.parse(value.timestamp)
        });
      }
      handleMap.set(this, record);
      return record;
    }
  }
}

export class PIDRecord {
  private readonly _pid: PID;
  private _values: {
    index: number,
    type: PID | string,
    data: {
      format: string,
      value: string | object
    },
    ttl: number,
    timestamp: number
  }[] = [];

  constructor(pid: PID) {
    this._pid = pid;
  }

  get pid(): PID {
    return this._pid;
  }

  get values(): {
    index: number,
    type: string | PID
    data: {
      format: string,
      value: string | object
    },
    ttl: number,
    timestamp: number
  }[] {
    return this._values;
  }

  set values(newValues) {
    this._values = newValues;
  }

}

export class HSLColor {
  hue: number;
  sat: number;
  lum: number;

  constructor(hue: number, sat: number, lum: number) {
    this.hue = hue;
    this.sat = sat;
    this.lum = lum;
  }

  toString(): string {
    return `hsl(${this.hue}, ${this.sat}%, ${this.lum}%)`;
  }
}
