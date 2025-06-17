// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';
import '../components/json-viewer/json-viewer';

interface ParsedJsonResult {
  data?: object | string;
  error?: Error;
}

/**
 * Renderer for JSON objects/strings.
 */
export class JSONType extends GenericIdentifierType {
  private _parsedJsonResult: ParsedJsonResult | undefined = undefined;

  private getParsedJson(): ParsedJsonResult {
    if (this._parsedJsonResult === undefined) {
      try {
        if (typeof this.value === 'object' && this.value !== null) {
          // If the value is already an object, we can use it directly
          this._parsedJsonResult = { data: this.value };
          return this._parsedJsonResult;
        }

        // Handle potential edge cases with the input value
        if (typeof this.value !== 'string') {
          throw new Error('Input value is not a string or object');
        }

        // Trim whitespace before parsing to handle common input issues
        const trimmedValue = this.value.trim();

        // Handle empty strings
        if (trimmedValue === '') {
          this._parsedJsonResult = { error: new Error('Empty JSON string') };
          return this._parsedJsonResult;
        }

        const parsed = JSON.parse(trimmedValue);
        this._parsedJsonResult = { data: parsed };
      } catch (e) {
        this._parsedJsonResult = { error: e instanceof Error ? e : new Error(String(e)) };
      }
    }
    return this._parsedJsonResult;
  }

  getSettingsKey(): string {
    return 'JSONType';
  }

  async hasCorrectFormat(): Promise<boolean> {
    const { data, error } = this.getParsedJson();
    if (error) {
      console.warn('JSONType has incorrect format:', error.message, 'for value:', this.value);
      return false;
    }
    // Only objects and arrays are considered the "correct format" for rich rendering by this type
    return typeof data === 'object' && data !== null;
  }

  init(): Promise<void> {
    // Invalidate cache if data changes, though init() doesn't receive new value here
    // If `this.value` could be externally changed after instantiation, a setter for `value`
    // in GenericIdentifierType or here should clear _parsedJsonResult.
    this._parsedJsonResult = undefined;
    return Promise.resolve();
  }

  isResolvable(): boolean {
    return false;
  }

  renderPreview() {
    const { data: jsonObj, error } = this.getParsedJson();

    if (error) {
      return <span class="text-red-500">Invalid JSON</span>;
    }

    // Show a more condensed and user-friendly preview for objects/arrays
    const isComplexObjectOrArray = typeof jsonObj === 'object' && jsonObj !== null;
    const isArray = Array.isArray(jsonObj);

    if (isComplexObjectOrArray) {
      const entryCount = Object.keys(jsonObj).length;
      return (
        <div class="w-full">
          <div class="flex items-center rounded-md bg-gray-100 font-mono text-xs">
            <span class="mr-1 font-medium">{isArray ? 'Array' : 'Object'}</span>
            <span class="text-gray-500">{isArray ? '[' : '{'}</span>
            <span class="text-xs text-gray-500">
              {entryCount} {entryCount === 1 ? 'item' : 'items'}
            </span>
            <span class="text-gray-500">{isArray ? ']' : '}'}</span>
          </div>
        </div>
      );
    }

    // For simple JSON values (strings, numbers, booleans, null), show the stringified value
    return (
      <div class="w-full">
        <pre class="max-w-full overflow-x-auto rounded-md bg-gray-100 font-mono text-xs whitespace-pre-wrap">{JSON.stringify(jsonObj, null, 2)}</pre>
      </div>
    );
  }

  renderBody(): FunctionalComponent<never> {
    const { data: parsedData, error } = this.getParsedJson();

    if (error) {
      return (
        <div class="w-full overflow-y-auto">
          <span class="text-red-500">Invalid JSON data: {error.message}</span>
        </div>
      );
    }

    return (
      <div class="w-full overflow-y-auto">
        <json-viewer data={parsedData} expand-all={false} show-line-numbers={true} theme="light">
          {/* This slot content will be shown if json-viewer itself fails or if data is not renderable by it */}
          <span class="text-red-500">Could not display JSON data.</span>
        </json-viewer>
      </div>
    );
  }
}
