import {FunctionalComponent} from "@stencil/core";
import {FoldableItem} from "./FoldableItem";
import {FoldableAction} from "./FoldableAction";

export abstract class GenericIdentifierType {
  private readonly _value: string;

  private _settings: {
    name: string,
    value: any
  }[] = [];

  private _items: FoldableItem[] = [];
  private _actions: FoldableAction[] = [];

  constructor(value: string)
  constructor(value: string, settings?: { name: string; value: any }[]) {
    this._value = value;
    this._settings = settings;
    console.log("GenericIdentifierType", this._value, this._settings);
  }

  get value(): string {
    return this._value;
  }

  get settings(): { name: string; value: any }[] {
    return this._settings;
  }

  set settings(value: { name: string; value: any }[]) {
    this._settings = value;
  }

  get items(): FoldableItem[] {
    return this._items;
  }

  get actions(): FoldableAction[] {
    return this._actions;
  }

  abstract init(): Promise<void>;

  abstract isResolvable(): boolean;

  abstract hasCorrectFormat(): boolean;

  abstract getSettingsKey(): string;

  abstract renderPreview(): FunctionalComponent<any>;

  abstract renderBody(): FunctionalComponent<any>;
}
