# PID Component

[![Build](https://github.com/kit-data-manager/pid-component/actions/workflows/npm-ci.yml/badge.svg?branch=main)](https://github.com/kit-data-manager/pid-component/actions/workflows/ci.yml)
[![CodeQL](https://github.com/kit-data-manager/pid-component/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/kit-data-manager/pid-component/actions/workflows/github-code-scanning/codeql)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.13629109.svg)](https://doi.org/10.5281/zenodo.13629109)
[![npm version](https://img.shields.io/npm/v/@kit-data-manager/pid-component.svg)](https://www.npmjs.com/package/@kit-data-manager/pid-component)
[![npm downloads](https://img.shields.io/npm/dm/@kit-data-manager/pid-component.svg)](https://www.npmjs.com/package/@kit-data-manager/pid-component)
[![License](https://img.shields.io/github/license/kit-data-manager/pid-component.svg)](https://spdx.org/licenses/Apache-2.0)
[![Storybook](https://raw.githubusercontent.com/storybooks/brand/master/badge/badge-storybook.svg)](https://kit-data-manager.github.io/pid-component)

The `pid-component` is an easily extensible web component that can be used to display PIDs, ORCiDs, and other
identifiers in a user-friendly way.
It is easily extensible to support other identifier types.

> A [React wrapper]() is also available

The `pid-component` dynamically renders a component based on the value of the `value` property.
Depending on the value, it decides which component to render, what priority to give it, and what props to pass to it.
It also renders itself recursively for all its children when unfolded.
You can set the maximum depth of recursion with the `level-of-subcomponents` property.
By default, it is set to 1, which means that it will only render the first level of children, but not their children.
You can prohibit unfolding of the component by setting the `current-level-of-subcomponents` to the same value as
the `level-of-subcomponents` property.

To use the component, import the [npm-package](https://www.npmjs.com/package/@kit-data-manager/pid-component)
via [unpkg](https://unpkg.com/).
Note that two scripts are provided: one for modern browsers (type="module") and a fallback for older browsers (
nomodule).
Include **both** scripts to ensure support for modern browsers (ESM) and legacy browsers:

```html

<head>
  <script type="module"
          src="https://unpkg.com/@kit-data-manager/pid-component/dist/pid-component/pid-component.esm.js"></script>
  <script nomodule src="https://unpkg.com/@kit-data-manager/pid-component/dist/pid-component/pid-component.js"></script>
</head>
```

Alternatively, you can install the package via npm:

```bash
npm install @kit-data-manager/pid-component
```

Then, you can use this component like this:

```html
<pid-component value="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6"></pid-component>
```

<div>
<aside>
<script type="module" src="https://unpkg.com/@kit-data-manager/pid-component/dist/pid-component/pid-component.esm.js"></script>
<script nomodule src="https://unpkg.com/@kit-data-manager/pid-component/dist/pid-component/pid-component.js"></script>
<pid-component value="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6"></pid-component>
</aside>
</div>

You can try this web component in the [demo](https://kit-data-manager.github.io/pid-component).

**Only use the `pid-component` component! All the others are only for internal use and may change at any moment...**

There are detailed docs for the `pid-component` component
available [in the Storybook](https://kit-data-manager.github.io/pid-component) and in
the [source code](packages/stencil-library/src/components/pid-component/readme.md).

**Please notice that you must use the hyphenated version of an attribute when using the component directly in HTML (
e.g. `currentLevelOfSubcomponents` -> `current-level-of-subcomponents`).
When using inside Stencil or with JSX/TSX syntax, you must use the camelCase version.**

## Supported Types

The component automatically detects and renders the following types:

- **PIDs**: Resolvable via [handle.net](https://handle.net).
- **DOIs**: With DataCite or CrossRef metadata; resolvable via [doi.org](https://doi.org). Supports various citation
  styles.
- **ORCiDs**: Resolvable via [orcid.org](https://orcid.org). Displays profile information, affiliations, works, etc.
- **RORs**: Resolvable via [ror.org](https://ror.org). Displays organization details, hierarchies, and location.
- **SPDX**: License identifiers and URLs.
- **URLs**: Starting with http:// or https://.
- **Email-addresses**: Individual or comma-separated lists.
- **Dates**: Formatted date strings.
- **JSON objects**: Rendered with syntax highlighting and tree view using `json-viewer`.
- **Locales**: e.g., en-US, de-DE. Visualized with flags (if region is present).
- **Fallback**: Everything else is rendered as a simple string.

## Configuration & Settings

You can customize the behavior of specific renderers by passing a JSON configuration string to the `settings` property.

### Available Settings

**Global Settings**

- `ttl` (number): Time-to-live in milliseconds for cached data (default: varies by type).

**DOIType**

- `citationStyle` (string): The citation style to use for the preview.
  - Options: `APA`, `Chicago`, `IEEE`, `Harvard`, `Anglia Ruskin`.
  - Default: `APA`.

**ORCIDType**

- `showAffiliation` (boolean): Whether to show the affiliation in the summary.
  - Default: `true`.
- `affiliationAt` (string/date as ms): The date for which the affiliation should be shown.
  - Default: Current date.

**JSONType**

- `darkMode` (string): The theme for the JSON viewer.
  - Options: `light`, `dark`, `system`.
  - Default: `system`.

### Example Configuration

```html

<pid-component
  value="https://orcid.org/0000-0000-0000-0000"
  settings='[{"type":"ORCIDType","values":[{"name":"showAffiliation","value":false}]}]'
></pid-component>
```

## PID Resolver

The `pid-component` package exports a useful helper class for resolving PIDs. These are `PID`, `PIDDataType` and `PIDRecord` and can be
imported like this:

```typescript
import { PID, PIDDataType, PIDRecord } from "@kit-data-manager/pid-component"

const pid = new PID("21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6")
const pidRecord = await pid.resolve()
const pidDataType = await PIDDataType.resolveDataType(pid)
```

Further documentation is available in the [source code](packages/stencil-library/src/rendererModules/Handle/PID.ts).

## Monorepo

This is a monorepo containing the following packages:

 - stencil-library (@kit-data-manager/pid-component)
 - react-library (@kit-data-manager/react-pid-component)

[Lerna](https://lerna.js.org) is used for managing and building the packages (but you can also do it manually). To use, install Lerna:

    npm install --global lerna

and then use it to build the packages:

    lerna run build

It will make sure to build the packages in the correct order.

## How to run when developing

1. Clone the repo
2. Run `npm install`

For running storybook in dev mode, navigate to `packages/stencil-library` and run these commands in separate terminals:

- `npm run buildWatch`
- `npm run storybook`

Attention: Do **NOT** run `npm run start`. It will cause the storybook to not work properly.
If you did run `npm run start`, delete the following folders (in `packages/stencil-library`) and run `npm install` again:

- `node_modules`
- `www`
- `dist`
- `loader`
- `.stencil`
