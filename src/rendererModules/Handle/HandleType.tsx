import {PIDRecord} from './PIDRecord';
import {PID} from './PID';
import {PIDDataType} from './PIDDataType';
import {FunctionalComponent, h} from '@stencil/core';
import {GenericIdentifierType} from "../../utils/GenericIdentifierType";
import {FoldableItem} from "../../utils/FoldableItem";
import {FoldableAction} from "../../utils/FoldableAction";

/**
 * This class specifies a custom renderer for handles.
 * @extends GenericIdentifierType
 */
export class HandleType extends GenericIdentifierType {
  /**
   * The parts of the PID separated by a slash.
   * @type {{text: string; color: HSLColor, nextExists: boolean}[]}
   * @private
   */
  private _parts: {
    /**
     * The text of the part.
     * @type {string}
     */
    text: string;

    /**
     * Whether there is a next part.
     * @type {boolean}
     */
    nextExists: boolean;
  }[] = [];

  /**
   * The PID record.
   * @type {PIDRecord}
   * @private
   */
  private _pidRecord: PIDRecord;

  hasCorrectFormat(): boolean {
    return PID.isPID(this.value);
  }

  async init(): Promise<void> {
    const pid = PID.getPIDFromString(this.value);

    // Generate the colors for the parts of the PID
    this._parts = await Promise.all([
      {
        text: pid.prefix,
        nextExists: true,
      },
      {
        text: pid.suffix,
        nextExists: false,
      },
    ]);

    // Resolve the PID
    const resolved = await pid.resolve();
    this._pidRecord = resolved;
    for (const value of resolved.values) {
      if (value.type instanceof PIDDataType) {
        this.items.push(new FoldableItem(0, value.type.name, value.data.value, value.type.description, value.type.redirectURL, value.type.regex));
      }
    }

    this.actions.push(new FoldableAction(0, 'Open in FAIR-DOscope', `https://kit-data-manager.github.io/fairdoscope/?pid=${resolved.pid.toString()}`, 'primary'));

    return;
  }

  isResolvable(): boolean {
    return this._pidRecord.values.length > 0;
  }

  renderPreview(): FunctionalComponent<any> {
    return (
      <span class={'font-mono bg-inherit font-bold rounded-md'}>
        {this._parts.map(element => {
          return (
            <span class={'font-bold font-mono'}>
              <color-highlight text={element.text}/>
              <span class={'font-mono font-bold text-gray-800 mx-0.5'}>{element.nextExists ? '/' : ''}</span>
            </span>
          );
        })}
      </span>
    );
  }

  getSettingsKey(): string {
    return 'HandleType';
  }
}
