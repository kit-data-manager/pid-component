import {GenericIdentifierType} from "./GenericIdentifierType";
import {HandleType} from "./HandleType";
import {FallbackType} from "./FallbackType";
import {ORCIDType} from "./ORCIDType";
import {DateType} from "./DateType";

export class Parser {
  private static readonly _dataTypes: (new(value: string, settings?: {
    name: string,
    value: any
  }[]) => GenericIdentifierType)[] = [
    DateType,
    ORCIDType,
    HandleType,
    FallbackType,
  ];

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

  static async getBestFit(value: string, settings: {
    type: string, values: {
      name: string,
      value: any
    }[]
  }[]): Promise<GenericIdentifierType> {
    console.log("AllTypes", this._dataTypes);
    // let bestFit = this._dataTypes[this._dataTypes.length - 1];
    // console.log(new this._dataTypes[0](value));
    let bestFit = new this._dataTypes[this._dataTypes.length - 1](value)
    // let bestFit = this.create(this._dataTypes[length - 1], value);

    for (let i = this._dataTypes.length - 1; i >= 0; i--) {
      // if (this._dataTypes[i].prototype.hasCorrectFormat()) {
      //   bestFit = this._dataTypes[i];
      // }
      const obj = new this._dataTypes[i](value);
      // const obj = this.create(this._dataTypes[i], value);
      if (obj.hasCorrectFormat()) bestFit = obj;
    }

    console.log("Found bestFit", bestFit);

    // const obj = this.create(bestFit, value);
    try {
      const settingsKey = bestFit.getSettingsKey();
      const settingsValues = settings.find((value) => value.type === settingsKey)?.values;
      if (settingsValues) bestFit.settings = settingsValues;
    } catch (e) {
      console.log("No settings found for", bestFit.getSettingsKey());
    }

    await bestFit.init()
    return bestFit
  }

  // static create<T extends GenericIdentifierType>(
  //   c: new(value: string, settings?: {
  //     name: string,
  //     value: any
  //   }[]) => T,
  //   value: string,
  //   settings?: {
  //     name: string,
  //     value: any
  //   }[]): T {
  //   console.log("create", c, value, settings);
  //   return new c(value, settings);
  // }

}
