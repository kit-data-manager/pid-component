/**
 * This class represents an action that will most likely be rendered as a button.
 */
export class FoldableAction {
  /**
   * The priority of the action in the list of actions.
   * @type {number}
   * @private
   */
  private readonly _priority: number;

  /**
   * The title of the action.
   * Will be rendered as the text of the button.
   * @type {string}
   * @private
   */
  private readonly _title: string;

  /**
   * The link of the action.
   * Will be rendered as the link of the button.
   * @type {string}
   * @private
   */
  private readonly _link: string;

  /**
   * The style of the action.
   * primary: blue
   * secondary: gray
   * danger: red
   * @type {'primary' | 'secondary' | 'danger'}
   * @private
   */
  private readonly _style: 'primary' | 'secondary' | 'danger';

  /**
   * Creates a new FoldableAction object.
   * @param priority The priority of the action in the list of actions. (lower is better)
   * @param title The title of the action.
   * @param link The link of the action.
   * @param style The style of the action.
   * @constructor
   */
  constructor(priority: number, title: string, link: string, style: 'primary' | 'secondary' | 'danger') {
    this._priority = priority;
    this._title = title;
    this._link = link;
    this._style = style;
  }

  /**
   * Outputs the priority of the action.
   * @returns {number} The priority of the action.
   */
  get priority(): number {
    return this._priority;
  }

  /**
   * Outputs the title of the action.
   * @returns {string} The title of the action.
   */
  get title(): string {
    return this._title;
  }

  /**
   * Outputs the link of the action.
   * @returns {string} The link of the action.
   */
  get link(): string {
    return this._link;
  }

  /**
   * Outputs the style of the action.
   * @returns {'primary' | 'secondary' | 'danger'} The style of the action.
   */
  get style(): 'primary' | 'secondary' | 'danger' {
    return this._style;
  }

  /**
   * Checks equality with another FoldableAction by comparing all attributes.
   * @param other The other FoldableAction to compare.
   * @returns {boolean} True if all attributes are equal, false otherwise.
   */
  equals(other: FoldableAction): boolean {
    return this._priority === other._priority && this._title === other._title && this._link === other._link && this._style === other._style;
  }
}
