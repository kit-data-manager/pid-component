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

  // Dark mode property
  private isDarkMode: boolean = false;

  // Check for dark mode in settings
  private checkDarkMode(): boolean {
    const darkModeSetting = this.settings?.find(setting => setting.name === 'darkMode');
    if (darkModeSetting) {
      const darkMode = darkModeSetting.value as 'light' | 'dark' | 'system';
      if (darkMode === 'dark') {
        return true;
      } else if (darkMode === 'light') {
        return false;
      } else if (darkMode === 'system' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    return false;
  }

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
    // Update dark mode state
    this.isDarkMode = this.checkDarkMode();

    const { data: jsonObj, error } = this.getParsedJson();

    if (error) {
      return <span class={this.isDarkMode ? 'text-red-400' : 'text-red-500'}>Invalid JSON</span>;
    }

    // Show a more condensed and user-friendly preview for objects/arrays
    const isComplexObjectOrArray = typeof jsonObj === 'object' && jsonObj !== null;
    const isArray = Array.isArray(jsonObj);

    if (isComplexObjectOrArray) {
      const entryCount = Object.keys(jsonObj).length;
      return (
        <div class="w-full">
          <div class={`flex items-center rounded-md ${this.isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} font-mono text-xs`}>
            <span class={`mr-1 font-medium ${this.isDarkMode ? 'text-gray-200' : ''}`}>{isArray ? 'Array' : 'Object'}</span>
            <span class={this.isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{isArray ? '[' : '{'}</span>
            <span class={`text-xs ${this.isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {entryCount} {entryCount === 1 ? 'item' : 'items'}
            </span>
            <span class={this.isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{isArray ? ']' : '}'}</span>
          </div>
        </div>
      );
    }

    // For simple JSON values (strings, numbers, booleans, null), show the stringified value
    return (
      <div class="w-full">
        <pre class={`max-w-full overflow-x-auto rounded-md ${this.isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100'} font-mono text-xs whitespace-pre-wrap`}>
          {JSON.stringify(jsonObj, null, 2)}
        </pre>
      </div>
    );
  }

  renderBody(): FunctionalComponent<never> {
    // Update dark mode state
    this.isDarkMode = this.checkDarkMode();

    const { data: parsedData, error } = this.getParsedJson();

    if (error) {
      return (
        <div class="w-full overflow-y-auto">
          <span class={this.isDarkMode ? 'text-red-400' : 'text-red-500'}>Invalid JSON data: {error.message}</span>
        </div>
      );
    }

    return (
      <div class="w-full overflow-y-auto">
        <json-viewer data={parsedData} expand-all={false} show-line-numbers={true} theme={this.isDarkMode ? 'dark' : 'light'}>
          {/* This slot content will be shown if json-viewer itself fails or if data is not renderable by it */}
          <span class={this.isDarkMode ? 'text-red-400' : 'text-red-500'}>Could not display JSON data.</span>
        </json-viewer>
      </div>
    );
  }
}
