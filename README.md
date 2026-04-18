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

## Automatic PID Detection

The `pid-component` package includes an automatic PID detection feature that scans a DOM subtree for text containing
PIDs and replaces them with interactive `<pid-component>` elements.

```typescript
import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.getElementById('my-content'),
  darkMode: 'system',
  renderers: ['DOIType', 'ORCIDType', 'HandleType'],  // optional: try these first
  observe: true,   // watch for dynamic content changes
});

// Later:
controller.stop();     // pause MutationObserver
controller.rescan();   // re-scan the DOM
controller.destroy();  // remove all components, restore original text
```

Or with a plain `<script>` tag (no bundler):

```html
<script type="module">
  import { initPidDetection } from 'https://unpkg.com/@kit-data-manager/pid-component/dist/esm/index.js';

  initPidDetection({
    root: document.getElementById('content'),
    darkMode: 'system',
  });
</script>
```

### How It Works

1. Walks the DOM tree collecting text nodes (skips `<script>`, `<style>`, `<code>`, `<pre>`, `<pid-component>`, etc.)
2. Tokenizes text and sanitizes surrounding punctuation (dots, commas, quotes, brackets)
3. Runs tokens through the detection registry (same regex patterns used by the renderers)
4. Wraps only matched PID tokens in `<pid-component>` elements — non-matching text stays untouched
5. Original text stays visible until the component finishes loading; on failure, original text is restored

### Configuration Options

| Option                 | Type          | Default         | Description                                              |
|------------------------|---------------|-----------------|----------------------------------------------------------|
| `root`                 | `HTMLElement` | `document.body` | Root element to scan                                     |
| `renderers`            | `string[]`    | all             | Ordered renderer preselection (non-binding)              |
| `fallbackToAll`        | `boolean`     | `true`          | Fall back to full registry if preselection doesn't match |
| `exclude`              | `string`      | —               | CSS selector for elements to skip                        |
| `observe`              | `boolean`     | `false`         | Watch for new DOM nodes (MutationObserver)               |
| `darkMode`             | `string`      | `"light"`       | `"light"`, `"dark"`, or `"system"`                       |
| `settings`             | `string`      | `"[]"`          | JSON settings for all detected components                |
| `levelOfSubcomponents` | `number`      | `1`             | Max depth of nested subcomponents                        |
| `amountOfItems`        | `number`      | `10`            | Items per page in data tables                            |
| `emphasizeComponent`   | `boolean`     | `true`          | Show border/shadow on components                         |
| `showTopLevelCopy`     | `boolean`     | `true`          | Show copy button on top-level components                 |
| `defaultTTL`           | `number`      | `86400000`      | Cache TTL in milliseconds                                |

### Available Renderer Keys

`DateType`, `ORCIDType`, `DOIType`, `HandleType`, `RORType`, `SPDXType`, `EmailType`, `URLType`, `LocaleType`,
`JSONType`

### Framework Integration

- **React**: Call in `useEffect()`, return `controller.destroy()` as cleanup
- **Angular**: Call in `ngAfterViewInit()`, cleanup in `ngOnDestroy()`
- **Vue**: Call in `onMounted()`, cleanup in `onUnmounted()`

See the [Storybook documentation](https://kit-data-manager.github.io/pid-component/?path=/docs/auto-detection--docs) for
detailed examples and interactive demos.

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

## Development and Testing

This project uses a combination of unit, end-to-end (E2E), accessibility (a11y), and visual regression tests to ensure
high quality.

### Prerequisites

1. Clone the repo
2. Run `npm ci` at the root

### Build

To build all packages in the correct order using Lerna:

```bash
npm run build
```

### Running Tests

**1. Unit and E2E Tests (Stencil + Jest + Puppeteer)**
Run all spec and E2E tests across the monorepo with coverage enforcement:

```bash
npm test
```

To run tests in watch mode during development (from `packages/stencil-library`):

```bash
npm run test.watch
```

**2. Storybook Accessibility Tests**
The Storybook test runner audits all stories for accessibility violations using `axe-core`. It uses a ratchet mechanism
to ensure violations never increase.

```bash
cd packages/stencil-library
npm run test:storybook
```

*Note: If you intentionally add a story with unavoidable a11y violations, you can update the baseline by
running `UPDATE_A11Y_BASELINE=true npm run test:storybook`.*

**3. Playwright Interaction & Visual Regression Tests**
Playwright tests are located in `packages/stencil-library/test/` and run against the Storybook UI.

```bash
cd packages/stencil-library
npx playwright install --with-deps chromium
npx playwright test --project=chromium
```

To update visual baseline screenshots:

```bash
npx playwright test --update-snapshots --project=chromium
```

### Adding New Playwright Tests

To add a new test, create a `*.spec.ts` file in `packages/stencil-library/test/`.
Tests should navigate to an isolated Storybook story and interact with it:

```typescript
import { test, expect } from '@playwright/test';

test('my new component interaction', async ({ page }) => {
  // 1. Navigate to the isolated story (get the ID from the Storybook URL)
  await page.goto('/iframe.html?id=my-component--default&viewMode=story');

  // 2. Interact with the component
  const button = page.locator('my-component button');
  await button.click();

  // 3. Assert state and take a visual snapshot
  await expect(button).toHaveText('Clicked');
  await expect(page).toHaveScreenshot('my-component-clicked.png');
});
```

### Continuous Integration (CI)

The `.github/workflows/npm-ci.yml` pipeline automatically runs on pushes and PRs:

- Builds the components
- Enforces code formatting and linting
- Runs Stencil Unit & E2E tests with coverage thresholds (Branches: 58%, Functions: 75%, Lines: 72%, Statements: 70%)
- Builds Storybook and runs the A11y test-runner ratchet
- Runs Playwright interaction and visual regression tests

Additionally, Chromatic runs on PRs to provide visual UI review and a deployed Storybook preview link.

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
