# json-viewer

<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description                                                            | Type                | Default     |
| ----------------- | ------------------- | ---------------------------------------------------------------------- | ------------------- | ----------- |
| `data`            | `data`              | The JSON data to display. Can be a JSON string or a JavaScript object. | `object \| string`  | `undefined` |
| `expandAll`       | `expand-all`        | Set to true to open all nodes in tree view initially.                  | `boolean`           | `false`     |
| `maxHeight`       | `max-height`        | Maximum height of the viewer in pixels. Set to 0 for no limit.         | `number`            | `500`       |
| `showLineNumbers` | `show-line-numbers` | Set to true to enable line numbers in code view.                       | `boolean`           | `true`      |
| `theme`           | `theme`             | Theme for syntax highlighting. Options: 'light' or 'dark'.             | `"dark" \| "light"` | `'light'`   |
| `viewMode`        | `view-mode`         | Initial view mode for the JSON data. Can be 'tree' or 'code'.          | `"code" \| "tree"`  | `'tree'`    |


## Methods

### `collapseAllNodes() => Promise<void>`

Collapse all nodes in the tree view

#### Returns

Type: `Promise<void>`



### `expandAllNodes() => Promise<void>`

Expand all nodes in the tree view

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description                                                                   |
| ---- | ----------------------------------------------------------------------------- |
|      | Content is placed inside the component as a fallback if input data is invalid |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
