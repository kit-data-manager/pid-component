# @kit-data-manager/react-pid-component

React wrapper for [@kit-data-manager/pid-component](https://github.com/kit-data-manager/pid-component)

## Usage

Refer to the documentation of [@kit-data-manager/pid-component](https://github.com/kit-data-manager/pid-component). 

> **Important:** When using the React wrapper you have to use camelCase. Component names must be capitalized in React, see below.

### Example

```typescript jsx
import { PidComponent } from "@kit-data-manager/react-pid-component"

function MyComponent() {
  return <PidComponent value={"something"} emphasizeContent={false}  />
}
```