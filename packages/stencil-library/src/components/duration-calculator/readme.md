# duration-calculator



<!-- Auto Generated Below -->


## Overview

A compact end-datetime calculator for ISO 8601 durations.

It accepts an ISO duration string (e.g. `P7DT2H`) and shows a single row with
a start datetime input on the left, two direction arrow buttons in the middle,
and an end datetime input on the right. Clicking the right arrow (→) computes
the end datetime from the start; clicking the left arrow (←) computes the
start datetime from the end. The computed input is highlighted with a green
border so the result stands out.

## Properties

| Property      | Attribute      | Description                                          | Type      | Default     |
| ------------- | -------------- | ---------------------------------------------------- | --------- | ----------- |
| `darkMode`    | `dark-mode`    | Whether the calculator should use dark-mode styling. | `boolean` | `false`     |
| `isoDuration` | `iso-duration` | The ISO 8601 duration, e.g. "P7DT2H".                | `string`  | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
