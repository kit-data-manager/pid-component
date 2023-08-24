import { FunctionalComponent } from '@stencil/core';
import { FoldableItem } from './FoldableItem';
import { FoldableAction } from './FoldableAction';

/**
 * GenericIdentifierType is the base class for all identifier types that should be parsed and rendered into the pid-component component.
 * It contains the basic structure of a component object and the abstract methods that need to be implemented by the child classes.
 */
export abstract class GenericIdentifierType {
  /**
   * The value that should be parsed and rendered
   * @private
   * @readonly
   * @type {string}
   */
  private readonly _value: string;

  /**
   * The settings of the environment from which the settings for the component are extracted.
   * @private
   * @type {{name: string, value: any}[]}
   */
  private _settings: {
    name: string;
    value: any;
  }[] = [];

  /**
   * The list of items that should be rendered in the component.
   * @private
   * @type {FoldableItem[]}
   */
  private _items: FoldableItem[] = [];

  /**
   * The list of actions that should be rendered in the component.
   * @private
   * @type {FoldableAction[]}
   */
  private _actions: FoldableAction[] = [];

  /**
   * Creates a new GenericIdentifierType object
   * @param value The value that should be parsed and rendered
   * @constructor
   */
  constructor(value: string);

  /**
   * Creates a new GenericIdentifierType object
   * @param value The value that should be parsed and rendered
   * @param settings The settings of the environment from which the settings for the component are extracted.
   * @constructor
   */
  constructor(value: string, settings?: { name: string; value: any }[]) {
    this._value = value;
    this._settings = settings;
  }

  /**
   * Returns the value that should be parsed and rendered
   * @returns {string} The value that should be parsed and rendered
   */
  get value(): string {
    return this._value;
  }

  /**
   * Returns the settings of the environment from which the settings for the component are extracted.
   * @returns {{name: string, value: any}[]} The settings of the environment from which the settings for the component are extracted.
   */
  get settings(): { name: string; value: any }[] {
    return this._settings;
  }

  /**
   * Sets the settings of the environment from which the settings for the component are extracted.
   * @param value The settings of the environment from which the settings for the component are extracted.
   */
  set settings(value: { name: string; value: any }[]) {
    this._settings = value;
  }

  /**
   * Returns the list of items that should be rendered in the component.
   * @returns {FoldableItem[]} The list of items that should be rendered in the component.
   */
  get items(): FoldableItem[] {
    return this._items;
  }

  /**
   * Sets the list of items that should be rendered in the component.
   * @return {FoldableItem[]} The list of items that should be rendered in the component.
   */
  get actions(): FoldableAction[] {
    return this._actions;
  }

  /**
   * This asynchronous method is called when the component is initialized.
   * It should be used to fetch data from external sources and generate the items and actions that should be rendered in the component.
   * It must be implemented by the child classes as it is abstract.
   * @abstract
   */
  abstract init(): Promise<void>;

  /**
   * This method indicates if a value is resolvable or not.
   * It could be used to resolve the value via an external API and check if the returned value is valid or even existing.
   * It must be implemented by the child classes as it is abstract.
   * @returns {boolean} Whether the value is resolvable or not.
   * @abstract
   */
  abstract isResolvable(): boolean;

  /**
   * This method indicates if a value has the correct format or not.
   * It is heavily recommended to use a regular expression to check the format.
   * It must be implemented by the child classes as it is abstract.
   * @returns {boolean} Whether the value has the correct format or not.
   * @abstract
   */
  abstract hasCorrectFormat(): boolean;

  /**
   * This method returns the key that is used to identify the settings for this component.
   * It must be implemented by the child classes as it is abstract.
   * @returns {string} The key that is used to identify the settings for this component.
   * @abstract
   */
  abstract getSettingsKey(): string;

  /**
   * This method renders the preview of the component.
   * It is e.g. used in the summary of the detail element (The part you see when the component is folded).
   * It is recommended to use TSX syntax to implement this method.
   * It must be implemented by the child classes as it is abstract.
   * @returns {FunctionalComponent<any>} The preview of the component.
   * @abstract
   */
  abstract renderPreview(): FunctionalComponent<any>;

  /**
   * This method renders the body of the component.
   * It is shown between the table and actions in the detail element (The part you see when the component is unfolded).
   * It is recommended to use TSX syntax to implement this method.
   * By default, it returns undefined, which means that it is not rendered.
   * @returns {FunctionalComponent<any> | undefined} The body of the component.
   */
  renderBody(): FunctionalComponent<any> | undefined {
    return undefined;
  }
}
