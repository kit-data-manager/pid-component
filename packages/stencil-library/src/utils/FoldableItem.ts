// No imports needed

/**
 * This is a class used to represent every line in the pid-component.
 */
export class FoldableItem {
  /**
   * The priority of the item.
   * Lower priority items are rendered first.
   * @type {number}
   * @private
   */
  private readonly _priority: number;

  /**
   * The text that should be rendered as the key.
   * @type {string}
   * @private
   */
  private readonly _keyTitle: string;

  /**
   * The text that should be used as the value.
   * @private
   */
  private readonly _value: string;

  /**
   * The tooltip that should be shown for the key.
   * @type {string}
   * @private
   */
  private readonly _keyTooltip?: string;

  /**
   * The link where the key should redirect to.
   * @type {string}
   * @private
   */
  private readonly _keyLink?: string;

  /**
   * The regex that should be used to validate the value.
   * (not implemented yet)
   * @type {RegExp}
   * @private
   */
  private readonly _valueRegex?: RegExp;

  /**
   * Whether the value should be rendered or displayed as text.
   * Useful when you want to show a raw value that would normally be rendered by the component.
   * When this is true, the value is rendered by the component otherwise it is displayed as text.
   * @type {boolean}
   * @private
   */
  private readonly _renderDynamically?: boolean;

  /**
   * The priority of the type of the value.
   * @type {number}
   * @private
   */
  private readonly _estimatedTypePriority: number = 0;

  /**
   * The constructor of FoldableItem.
   * @param priority The priority of the item.
   * @param keyTitle The text that should be rendered as the key.
   * @param value The text that should be used as the value.
   * @param keyTooltip The tooltip that should be shown for the key.
   * @param keyLink The link where the key should redirect to.
   * @param valueRegex The regex that should be used to validate the value.
   * @param renderDynamically Whether the value should be rendered or displayed as text.
   * @constructor
   */
  constructor(priority: number, keyTitle: string, value: string, keyTooltip?: string, keyLink?: string, valueRegex?: RegExp, renderDynamically?: boolean) {
    this._priority = priority;
    this._keyTitle = keyTitle;
    this._value = value;
    this._keyTooltip = keyTooltip;
    this._keyLink = keyLink;
    this._valueRegex = valueRegex;
    this._renderDynamically = renderDynamically !== undefined ? renderDynamically : true; // Default to true if not provided
    // If the value shouldn't be rendered dynamically, the estimated type priority is the highest value possible (very unimportant information).
    // Set a default value for estimated type priority
    this._estimatedTypePriority = renderDynamically ? 0 : 0; // Using 0 as default value
  }

  /**
   * Returns the priority of the item.
   * @returns {number} The priority of the item.
   */
  get priority(): number {
    return this._priority;
  }

  /**
   * Returns the text that should be rendered as the key.
   * @returns {string} The text that should be rendered as the key.
   */
  get keyTitle(): string {
    return this._keyTitle;
  }

  /**
   * Returns the text that should be used as the value.
   * @returns {string} The text that should be used as the value.
   */
  get value(): string {
    return this._value;
  }

  /**
   * Returns the tooltip that should be shown for the key.
   * @returns {string} The tooltip that should be shown for the key.
   */
  get keyTooltip(): string {
    return this._keyTooltip;
  }

  /**
   * Returns the link where the key should redirect to.
   * @returns {string} The link where the key should redirect to.
   */
  get keyLink(): string {
    return this._keyLink;
  }

  /**
   * Returns the regex that should be used to validate the value.
   * @returns {RegExp} The regex that should be used to validate the value.
   */
  get valueRegex(): RegExp {
    return this._valueRegex;
  }

  /**
   * Returns whether the value should be rendered or displayed as text.
   * True means the value is rendered by the component; false means it is displayed as text.
   * @returns {boolean} Whether the value should be rendered or displayed as text.
   */
  get renderDynamically(): boolean {
    return this._renderDynamically;
  }

  /**
   * Returns the priority of the type of the value.
   * @returns {number} The priority of the type of the value.
   */
  get estimatedTypePriority(): number {
    return this._estimatedTypePriority;
  }

  /**
   * Returns whether the value is valid, according to valueRegex.
   * @returns {boolean} Whether the value is valid, according to valueRegex.
   */
  isValidValue(): boolean {
    return this._valueRegex ? this._valueRegex.test(this._value) : true;
  }

  /**
   * Checks equality with another FoldableItem by comparing all attributes.
   * @param other The other FoldableItem to compare.
   * @returns {boolean} True if all attributes are equal, false otherwise.
   */
  equals(other: FoldableItem): boolean {
    return (
      this._keyTitle === other._keyTitle &&
      this._value === other._value &&
      this._keyTooltip === other._keyTooltip &&
      this._keyLink === other._keyLink &&
      this._renderDynamically === other._renderDynamically
    );
  }
}
