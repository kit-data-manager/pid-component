import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';
import { FoldableAction } from '../utils/FoldableAction';
import '../components/json-viewer/json-viewer';

/**
 * Renderer for JSON objects/strings.
 */
export class JSONType extends GenericIdentifierType {
  getSettingsKey(): string {
    return 'JSONType';
  }

  hasCorrectFormat(): boolean {
    try {
      if (typeof this.value === 'string') {
        const parsed = JSON.parse(this.value);
        // Only objects and arrays are valid JSON for rendering
        return typeof parsed === 'object' && parsed !== null;
      }
      if (typeof this.value === 'object' && this.value !== null) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  init(): Promise<void> {
    // Create a good filename from the first property or a default name
    let filename = 'data.json';
    try {
      const jsonObj = typeof this.value === 'string' ? JSON.parse(this.value) : this.value;
      // Try to create a meaningful filename from the first property if it's a string
      if (typeof jsonObj === 'object' && jsonObj !== null) {
        const firstKey = Object.keys(jsonObj)[0];
        if (firstKey && typeof jsonObj[firstKey] === 'string' && jsonObj[firstKey].length < 30) {
          filename = `${firstKey}-${jsonObj[firstKey].replace(/[^a-z0-9]/gi, '-')}.json`;
        } else if (firstKey && typeof jsonObj[firstKey] === 'number') {
          filename = `${firstKey}-${jsonObj[firstKey]}.json`;
        } else if (firstKey) {
          filename = `${firstKey}.json`;
        }
      }
    } catch {
      // If anything fails, use the default filename
    }

    // Add download action to the actions array
    this.actions.push(
      new FoldableAction(
        1,
        'Download JSON',
        `data:text/json;charset=utf-8,${encodeURIComponent(typeof this.value === 'string' ? this.value : JSON.stringify(this.value, null, 2))}#filename=${filename}`,
        'secondary',
      ),
    );
    return Promise.resolve();
  }

  isResolvable(): boolean {
    return false;
  }

  renderPreview(): FunctionalComponent<any> {
    let jsonObj: any = this.value;
    if (typeof this.value === 'string') {
      try {
        jsonObj = JSON.parse(this.value);
      } catch {
        return <span class="text-red-500">Invalid JSON</span>;
      }
    }

    // Show a more condensed and user-friendly preview
    const isComplex = typeof jsonObj === 'object' && jsonObj !== null;
    const isArray = Array.isArray(jsonObj);
    const entryCount = isComplex ? Object.keys(jsonObj).length : 0;

    // For complex objects/arrays, show a summary rather than the raw JSON
    if (isComplex) {
      return (
        <div class="w-full">
          <div class="bg-gray-100 rounded-md p-2 text-xs font-mono flex items-center">
            <span class="font-medium mr-1">{isArray ? 'Array' : 'Object'}</span>
            <span class="text-gray-500">{isArray ? '[' : '{'}</span>
            <span class="text-gray-500 text-xs ml-1">
              {entryCount} {entryCount === 1 ? 'item' : 'items'}
            </span>
            <span class="text-gray-500">{isArray ? ']' : '}'}</span>
          </div>
        </div>
      );
    }

    // For simple values, show the stringified value
    return (
      <div class="w-full">
        <pre class="bg-gray-100 rounded-md p-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-w-full">{JSON.stringify(jsonObj, null, 2)}</pre>
      </div>
    );
  }

  renderBody(): FunctionalComponent<any> {
    return (
      <json-viewer data={this.value} max-height={500} expand-all={false} show-line-numbers={true} theme="light">
        <span class="text-red-500">Invalid JSON data</span>
      </json-viewer>
    );
  }
}
