# pid-tooltip

<!-- Auto Generated Below -->


## Properties

| Property            | Attribute     | Description                                               | Type                                     | Default     |
| ------------------- | ------------- | --------------------------------------------------------- | ---------------------------------------- | ----------- |
| `fitContent`        | `fit-content` | Whether the tooltip should fit its content height exactly | `boolean`                                | `true`      |
| `maxHeight`         | `max-height`  | The maximum height of the tooltip                         | `string`                                 | `'150px'`   |
| `maxWidth`          | `max-width`   | The maximum width of the tooltip                          | `string`                                 | `'250px'`   |
| `position`          | `position`    | The position of the tooltip                               | `"bottom" \| "left" \| "right" \| "top"` | `'top'`     |
| `text` _(required)_ | `text`        | The text to display in the tooltip                        | `string`                                 | `undefined` |


## Dependencies

### Used by

 - [pid-data-table](../pid-data-table)

### Graph
```mermaid
graph TD;
  pid-data-table --> pid-tooltip
  style pid-tooltip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
