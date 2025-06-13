import { Component, h, Method, Prop, State, Watch } from '@stencil/core';

/**
 * @slot - Content is placed inside the component as a fallback if input data is invalid
 */
@Component({
  tag: 'json-viewer',
  styleUrl: 'json-viewer.css',
  shadow: true,
})
export class JsonViewer {
  /**
   * The JSON data to display. Can be a JSON string or a JavaScript object.
   */
  @Prop() data: string | object;

  /**
   * Initial view mode for the JSON data. Can be 'tree' or 'code'.
   */
  @Prop() viewMode: 'tree' | 'code' = 'tree';

  /**
   * Maximum height of the viewer in pixels. Set to 0 for no limit.
   */
  @Prop() maxHeight: number = 500;

  /**
   * Set to true to enable line numbers in code view.
   */
  @Prop() showLineNumbers: boolean = true;

  /**
   * Set to true to open all nodes in tree view initially.
   */
  @Prop() expandAll: boolean = false;

  /**
   * Theme for syntax highlighting. Options: 'light' or 'dark'.
   */
  @Prop() theme: 'light' | 'dark' = 'light';

  /**
   * Internal state to track the current view mode
   */
  @State() currentViewMode: 'tree' | 'code';

  /**
   * Track expanded nodes to maintain state between toggles
   */
  @State() expandedNodes: Set<string> = new Set();

  /**
   * Internal state to store the parsed JSON data
   */
  @State() parsedData: any = null;

  /**
   * Internal state to track error during JSON parsing
   */
  @State() error: string | null = null;

  /**
   * Internal state to indicate successful copy action
   */
  @State() copied: boolean = false;

  /**
   * Watch for changes in the data prop and reparse
   */
  @Watch('data')
  handleDataChange() {
    this.parseData();
  }

  /**
   * Watch for changes in the viewMode prop
   */
  @Watch('viewMode')
  handleViewModeChange() {
    this.currentViewMode = this.viewMode;
  }

  /**
   * Watch for changes in the expandAll prop
   */
  @Watch('expandAll')
  handleExpandAllChange() {
    if (this.expandAll) {
      this.expandAllNodes();
    } else {
      this.collapseAllNodes();
    }
  }

  /**
   * Component initialization
   */
  componentWillLoad() {
    this.currentViewMode = this.viewMode;
    this.parseData();
    if (this.expandAll) {
      this.expandAllNodes();
    }
  }

  /**
   * Parse the input data into a JavaScript object
   */
  private parseData() {
    try {
      if (typeof this.data === 'string') {
        this.parsedData = JSON.parse(this.data);
      } else if (this.data !== null && typeof this.data === 'object') {
        this.parsedData = this.data;
      } else {
        throw new Error('Invalid data format');
      }
      this.error = null;
    } catch (err) {
      this.error = err.message;
      this.parsedData = null;
    }
  }

  /**
   * Toggle between tree view and code view
   */
  private toggleView = () => {
    this.currentViewMode = this.currentViewMode === 'tree' ? 'code' : 'tree';
  };

  /**
   * Method to copy the JSON data to clipboard
   */
  private copyToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(this.parsedData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy JSON to clipboard', err);
    }
  };

  /**
   * Expand all nodes in the tree view
   */
  @Method()
  async expandAllNodes() {
    this.expandNodeRecursive(this.parsedData, 'root');
  }

  /**
   * Collapse all nodes in the tree view
   */
  @Method()
  async collapseAllNodes() {
    this.expandedNodes = new Set();
  }

  /**
   * Recursive function to expand all nodes
   */
  private expandNodeRecursive(data: any, path: string) {
    if (data !== null && typeof data === 'object') {
      this.expandedNodes.add(path);

      Object.entries(data).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        this.expandNodeRecursive(value, newPath);
      });

      // Create a new Set to trigger state update
      this.expandedNodes = new Set(this.expandedNodes);
    }
  }

  /**
   * Renders a JSON node as part of the tree view
   */
  private renderTreeNode = (key: string, value: any, depth: number = 0, path: string = '') => {
    const isExpandable = typeof value === 'object' && value !== null;
    const currentPath = path ? `${path}.${key}` : key;
    const nodeId = `node-${currentPath}`;

    if (isExpandable) {
      const isArray = Array.isArray(value);
      const entries = isArray ? Object.entries(value) : Object.entries(value);

      // Handle toggling of node expansion
      const toggleExpand = (e: Event) => {
        const details = (e.target as HTMLElement).closest('details');
        if (details && details.open) {
          this.expandedNodes.add(nodeId);
        } else {
          this.expandedNodes.delete(nodeId);
        }
        // Create a new Set to trigger state update
        this.expandedNodes = new Set(this.expandedNodes);
      };

      return (
        <div class="ml-4">
          <details class="mb-1" open={this.expandedNodes.has(nodeId)} onToggle={toggleExpand}>
            <summary
              class={`list-none relative pl-5 cursor-pointer font-mono flex items-center py-1 rounded group ${this.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
            >
              <div class="flex items-center w-full">
                <span class={`font-medium mr-2 ${this.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{key}: </span>
                <span class={`flex items-center gap-1 ${this.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>{isArray ? '[' : '{'}</span>
                  <span>
                    {entries.length} {entries.length === 1 ? 'item' : 'items'}
                  </span>
                  <span>{isArray ? ']' : '}'}</span>
                  <span class={`text-xs ml-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${this.theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}>
                    {this.expandedNodes.has(nodeId) ? 'Click to collapse' : 'Click to expand'}
                  </span>
                </span>
              </div>
            </summary>
            <div class={`ml-4 border-l-2 pl-3 ${this.theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              {entries.map(([k, v], index) => (
                <div key={`${nodeId}-${index}`}>{this.renderTreeNode(isArray ? `${k}` : k, v, depth + 1, currentPath)}</div>
              ))}
            </div>
          </details>
        </div>
      );
    }

    // Render primitive values with syntax highlighting
    let valueClass = '';
    let displayValue = JSON.stringify(value);

    if (typeof value === 'string') {
      valueClass = this.theme === 'dark' ? 'text-green-400' : 'text-green-600';
    } else if (typeof value === 'number') {
      valueClass = this.theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
    } else if (typeof value === 'boolean') {
      valueClass = this.theme === 'dark' ? 'text-purple-400' : 'text-purple-600';
    } else if (value === null) {
      valueClass = this.theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
      displayValue = 'null';
    }

    return (
      <div class={`flex items-center py-1 font-mono text-sm ${this.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
        <span class={`font-medium ${this.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{key}: </span>
        <span class={valueClass}>{displayValue}</span>
      </div>
    );
  };

  /**
   * Format a line of JSON for the code view with syntax highlighting
   */
  private formatCodeLine = (line: string) => {
    const stringClass = this.theme === 'dark' ? 'text-green-400' : 'text-green-600';
    const booleanClass = this.theme === 'dark' ? 'text-purple-400' : 'text-purple-600';
    const nullClass = this.theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    const numberClass = this.theme === 'dark' ? 'text-blue-400' : 'text-blue-600';

    return line
      .replace(/(".+?")(: )?/g, `<span class="${stringClass}">$1</span>$2`) // keys and string values
      .replace(/: (true|false)([,}\]\s])/g, `: <span class="${booleanClass}">$1</span>$2`) // booleans
      .replace(/: (null)([,}\]\s])/g, `: <span class="${nullClass}">$1</span>$2`) // null
      .replace(/: ([0-9]+(\.[0-9]+)?)([,}\]\s])/g, `: <span class="${numberClass}">$1</span>$3`); // numbers
  };

  render() {
    // Show error if JSON is invalid
    if (this.error) {
      return (
        <div class="p-4 text-red-500 text-center">
          <p>Invalid JSON: {this.error}</p>
          <slot></slot>
        </div>
      );
    }

    // Show message if no data
    if (!this.parsedData) {
      return (
        <div class="p-4 text-gray-500 text-center">
          <p>No data provided</p>
          <slot></slot>
        </div>
      );
    }

    // Format JSON for code view
    const formattedJson = JSON.stringify(this.parsedData, null, 2);
    const containerStyle = this.maxHeight > 0 ? { maxHeight: `${this.maxHeight}px` } : {};

    return (
      <div class={`rounded-lg overflow-hidden shadow border ${this.theme === 'dark' ? 'bg-gray-800 text-gray-50 border-gray-600' : 'bg-white text-gray-800 border-gray-200'}`}>
        <div class={`flex justify-between items-center p-3 border-b ${this.theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div class="flex items-center gap-2">
            <span class={`font-medium text-sm ${this.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>JSON Viewer</span>
            <span class={`text-xs ${this.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              ({Object.keys(this.parsedData).length} {Object.keys(this.parsedData).length === 1 ? 'property' : 'properties'})
            </span>
          </div>

          <button
            onClick={this.toggleView}
            class={`flex items-center gap-1 py-1.5 px-3 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 ${
              this.theme === 'dark'
                ? 'bg-gray-900 border border-gray-600 text-gray-50 hover:bg-gray-700 hover:border-blue-600'
                : 'bg-gray-100 border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-blue-400'
            }`}
          >
            {this.currentViewMode === 'tree' ? 'Code View' : 'Tree View'}
          </button>
        </div>

        <div class={`relative overflow-auto ${this.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`} style={containerStyle}>
          {/* Overlay copy button */}
          <button
            onClick={this.copyToClipboard}
            class={`absolute top-2 right-2 z-10 rounded-md transition-all duration-200 ${
              this.copied
                ? this.theme === 'dark'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800'
                : this.theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            } opacity-75 hover:opacity-100`}
            title={this.copied ? 'Copied!' : 'Copy JSON to clipboard'}
          >
            {this.copied ? (
              <span
                class="inline-block w-4 h-4 bg-contain bg-no-repeat bg-center"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E")`,
                }}
              ></span>
            ) : (
              <span
                class="inline-block w-4 h-4 bg-contain bg-no-repeat bg-center"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='13' height='13' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1'%3E%3C/path%3E%3C/svg%3E")`,
                }}
              ></span>
            )}
          </button>

          {/* Tree View */}
          {this.currentViewMode === 'tree' && (
            <div class={`p-4 pr-12 ${this.theme === 'dark' ? '' : 'bg-gray-50'}`}>
              {Object.entries(this.parsedData).map(([key, value], index) => (
                <div key={`root-${index}`}>{this.renderTreeNode(key, value, 0, 'root')}</div>
              ))}
            </div>
          )}

          {/* Code View */}
          {this.currentViewMode === 'code' && (
            <div class={`font-mono text-sm pr-12 ${this.theme === 'dark' ? '' : 'bg-gray-50'}`}>
              {this.showLineNumbers ? (
                <div class="flex">
                  <div
                    class={`py-4 px-2 text-right border-r select-none ${this.theme === 'dark' ? 'border-gray-600 text-gray-400 bg-gray-900' : 'border-gray-200 text-gray-500 bg-gray-100'}`}
                  >
                    {formattedJson.split('\n').map((_, i) => (
                      <div class="min-h-5" key={`line-${i}`}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <pre class={`p-4 whitespace-pre-wrap flex-grow overflow-x-auto ${this.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formattedJson.split('\n').map((line, i) => (
                      <div class="min-h-5" key={`code-${i}`} innerHTML={this.formatCodeLine(line)} />
                    ))}
                  </pre>
                </div>
              ) : (
                <pre class="p-4 whitespace-pre-wrap flex-grow overflow-x-auto">
                  {formattedJson.split('\n').map((line, i) => (
                    <div class="min-h-5" key={`code-${i}`} innerHTML={this.formatCodeLine(line)} />
                  ))}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
