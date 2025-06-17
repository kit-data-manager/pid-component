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
   * Tracks the effective dark mode state (true for dark, false for light)
   * @private
   * @type {boolean}
   */
  private _isDarkMode: boolean = false;

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
  constructor(value: string, settings?: { name: string; value: unknown }[]) {
    this._value = value;
    this._settings = settings;
    this.updateDarkMode();
  }

  /**
   * The settings of the environment from which the settings for the component are extracted.
   * @private
   * @type {{name: string, value: unknown}[]}
   */
  private _settings: {
    name: string;
    value: unknown;
  }[] = [];

  /**
   * Returns the settings of the environment from which the settings for the component are extracted.
   * @returns {{name: string, value: unknown}[]} The settings of the environment from which the settings for the component are extracted.
   */
  get settings(): { name: string; value: unknown }[] {
    return this._settings;
  }

  /**
   * Sets the settings of the environment from which the settings for the component are extracted.
   * @param value The settings of the environment from which the settings for the component are extracted.
   */
  set settings(value: { name: string; value: unknown }[]) {
    this._settings = value;
    // Update dark mode when settings change
    this.updateDarkMode();
  }

  /**
   * The list of items that should be rendered in the component.
   * @private
   * @type {FoldableItem[]}
   */
  private _items: FoldableItem[] = [];

  /**
   * Returns the list of items that should be rendered in the component.
   * @returns {FoldableItem[]} The list of items that should be rendered in the component.
   */
  get items(): FoldableItem[] {
    return this._items;
  }

  /**
   * The list of actions that should be rendered in the component.
   * @private
   * @type {FoldableAction[]}
   */
  private _actions: FoldableAction[] = [];

  /**
   * Sets the list of items that should be rendered in the component.
   * @return {FoldableItem[]} The list of items that should be rendered in the component.
   */
  get actions(): FoldableAction[] {
    return this._actions;
  }

  /**
   * Returns the value that should be parsed and rendered
   * @returns {string} The value that should be parsed and rendered
   */
  get value(): string {
    return this._value;
  }

  /**
   * Returns the data that is being rendered in the component.
   * By default, it returns undefined, which means that there is no meaningful data.
   * @returns {unknown} The data that is needed for rendering the component.
   */
  get data(): unknown {
    return undefined;
  }

  /**
   * This asynchronous method is called when the component is initialized.
   * It should be used to fetch data from external sources and generate the items and actions that should be rendered in the component.
   * It must be implemented by the child classes as it is abstract.
   * @param data The data that is needed for rendering the component.
   * @abstract
   * @returns {Promise<void>} A promise that resolves when the initialization is complete
   */
  abstract init(data?: unknown): Promise<void>;

  /**
   * This method indicates if a value has the correct format or not.
   * It is heavily recommended to use a regular expression to check the format.
   * It must be implemented by the child classes as it is abstract.
   * @returns {boolean} Whether the value has the correct format or not.
   * @abstract
   */
  abstract hasCorrectFormat(): Promise<boolean>;

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
   * @returns {FunctionalComponent<unknown>} The preview of the component.
   * @abstract
   */
  abstract renderPreview(): FunctionalComponent<unknown>;

  /**
   * This method renders the body of the component.
   * It is shown between the table and actions in the detail element (The part you see when the component is unfolded).
   * It is recommended to use TSX syntax to implement this method.
   * By default, it returns undefined, which means that it is not rendered.
   * @returns {FunctionalComponent<unknown> | undefined} The body of the component.
   */
  renderBody(): FunctionalComponent<unknown> | undefined {
    return undefined;
  }

  /**
   * Returns whether the component is in dark mode or not
   * @returns {boolean} Whether the component is in dark mode or not
   */
  get isDarkMode(): boolean {
    return this._isDarkMode;
  }

  /**
   * Updates the dark mode state based on settings
   * This method is called automatically when settings are updated
   */
  protected updateDarkMode(): void {
    // Look for darkMode setting
    const darkModeSetting = this._settings?.find(setting => setting.name === 'darkMode');

    if (darkModeSetting) {
      const darkMode = darkModeSetting.value as 'light' | 'dark' | 'system';

      if (darkMode === 'dark') {
        this._isDarkMode = true;
      } else if (darkMode === 'light') {
        this._isDarkMode = false;
      } else if (darkMode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
        // Check system preference
        this._isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } else {
      // Default to light mode if no setting is found
      this._isDarkMode = false;
    }
  }
}
