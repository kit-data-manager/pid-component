# PID Component

[![Build](https://github.com/kit-data-manager/pid-component/actions/workflows/npm-ci.yml/badge.svg?branch=main)](https://github.com/kit-data-manager/pid-component/actions/workflows/npm-ci.yml)
[![Node 22](https://img.shields.io/badge/Node-22-339933?logo=nodedotjs&logoColor=white)](https://github.com/kit-data-manager/pid-component/actions/workflows/npm-ci.yml)
[![Node 24](https://img.shields.io/badge/Node-24-339933?logo=nodedotjs&logoColor=white)](https://github.com/kit-data-manager/pid-component/actions/workflows/npm-ci.yml)
[![Node 25](https://img.shields.io/badge/Node-25-339933?logo=nodedotjs&logoColor=white)](https://github.com/kit-data-manager/pid-component/actions/workflows/npm-ci.yml)
[![Coverage](https://codecov.io/gh/kit-data-manager/pid-component/branch/main/graph/badge.svg)](https://codecov.io/gh/kit-data-manager/pid-component)
[![CodeQL](https://github.com/kit-data-manager/pid-component/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/kit-data-manager/pid-component/actions/workflows/github-code-scanning/codeql)

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.13629109.svg)](https://doi.org/10.5281/zenodo.13629109)
[![npm version](https://img.shields.io/npm/v/@kit-data-manager/pid-component.svg)](https://www.npmjs.com/package/@kit-data-manager/pid-component)
[![npm downloads](https://img.shields.io/npm/dm/@kit-data-manager/pid-component.svg)](https://www.npmjs.com/package/@kit-data-manager/pid-component)
[![License](https://img.shields.io/github/license/kit-data-manager/pid-component.svg)](https://spdx.org/licenses/Apache-2.0)
[![Storybook](https://raw.githubusercontent.com/storybooks/brand/master/badge/badge-storybook.svg)](https://kit-data-manager.github.io/pid-component)

The `pid-component` is an easily extensible web component that can be used to display PIDs, ORCiDs, and other
identifiers in a user-friendly way.
It is easily extensible to support other identifier types.

> Framework wrappers are available for [React](https://www.npmjs.com/package/@kit-data-manager/react-pid-component), [Vue](https://www.npmjs.com/package/@kit-data-manager/vue-pid-component), and [Angular](https://www.npmjs.com/package/@kit-data-manager/angular-pid-component).

The `pid-component` dynamically renders a component based on the value of the `value` property.
Depending on the value, it decides which component to render, what priority to give it, and what props to pass to it.
It also renders itself recursively for all its children when unfolded.
You can set the maximum depth of recursion with the `level-of-subcomponents` property.
By default, it is set to 1, which means that it will only render the first level of children, but not their children.
You can prohibit unfolding of the component by setting the `current-level-of-subcomponents` to the same value as
the `level-of-subcomponents` property.

### Via CDN (no bundler)

You can load the component directly from [unpkg](https://unpkg.com/) with a single script tag:

```html
<script type="module" src="https://unpkg.com/@kit-data-manager/pid-component/dist/pid-component/pid-component.esm.js"></script>

<pid-component value="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6"></pid-component>
```

<div>
<aside>
<script type="module" src="https://unpkg.com/@kit-data-manager/pid-component/dist/pid-component/pid-component.esm.js"></script>
<pid-component value="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6"></pid-component>
</aside>
</div>

### Via npm

```bash
npm install @kit-data-manager/pid-component
```

Then use the component in your HTML:

```html
<pid-component value="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6"></pid-component>
```

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

## Monorepo Structure

This is an npm workspaces monorepo managed by [Lerna](https://lerna.js.org). It contains:

| Package                    | npm                                                                                                                | Description                                         |
|----------------------------|--------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| `packages/stencil-library` | [`@kit-data-manager/pid-component`](https://www.npmjs.com/package/@kit-data-manager/pid-component)                 | Core Stencil web component library                  |
| `packages/react-library`   | [`@kit-data-manager/react-pid-component`](https://www.npmjs.com/package/@kit-data-manager/react-pid-component)     | React wrapper (auto-generated proxies)              |
| `packages/vue-library`     | [`@kit-data-manager/vue-pid-component`](https://www.npmjs.com/package/@kit-data-manager/vue-pid-component)         | Vue 3 wrapper (auto-generated proxies)              |
| `packages/angular-library` | [`@kit-data-manager/angular-pid-component`](https://www.npmjs.com/package/@kit-data-manager/angular-pid-component) | Angular standalone wrapper (auto-generated proxies) |
| `packages/nextjs-app`      | *(private)*                                                                                                        | Next.js demo app with React (SSR) Storybook         |

The framework wrappers are thin proxy layers generated by Stencil's output targets during the
`stencil-library` build. They forward props and events to the underlying web components.

## Development

### Prerequisites

- Node.js 22+
- npm (this project uses npm exclusively; do not use yarn or pnpm)

### Setup

```bash
git clone https://github.com/kit-data-manager/pid-component.git
cd pid-component
npm ci
```

### Building

Build all packages in dependency order:

```bash
npm run build
```

This runs `npx lerna run build`, which:

1. Builds `stencil-library` first (`stencil build --docs`), generating the web components, the
   `dist/` and `hydrate/` outputs, plus the auto-generated framework proxy code in the
   sibling wrapper packages.
2. Builds `react-library`, `vue-library`, and `angular-library` (each runs `tsc` to compile their
   generated proxy code).

To rebuild the Stencil library in watch mode during development:

```bash
cd packages/stencil-library
npm run buildWatch
```

### Running Storybook

Storybook is configured at the **repository root** (`.storybook/`) and serves stories from
`packages/stencil-library/src/`. It requires the Stencil library to be built first.

**Main Storybook (Web Components):**

```bash
npm run build                 # build all packages first
npm run storybook             # starts on http://localhost:6006
```

**Composed Storybook (all frameworks):**

The project uses [Storybook Composition](https://storybook.js.org/docs/sharing/storybook-composition)
to display framework-specific stories from the React, Vue, Angular, and Next.js wrapper packages
alongside the main Web Components stories. To run the full composed Storybook locally:

```bash
npm run storybook:all
```

This uses `concurrently` + `wait-on` to:

1. Start the React (Vite) sub-Storybook on port 6007
2. Start the Vue sub-Storybook on port 6008
3. Start the Angular sub-Storybook on port 6009
4. Start the React (Next.js) sub-Storybook on port 6010
5. Wait for all four, then start the main composed Storybook on port 6006

You can kill all storybooks with `lsof -tiTCP:6006-6010 -sTCP:LISTEN | xargs kill`.

You can also run just the main Storybook (`npm run storybook`) without the framework
sub-Storybooks; the composed refs will simply show as unavailable.

**Build a static Storybook:**

```bash
npm run build-storybook
```

This builds the main Storybook and all framework sub-Storybooks into `storybook-static/`,
with the sub-Storybooks placed in subdirectories (`react-vite/`, `vue/`, `angular/`,
`react-nextjs/`).

## Testing

This project uses [Vitest](https://vitest.dev/) for all testing:

- **Stencil unit/spec tests** run via [`@stencil/vitest`](https://stenciljs.com/docs/testing-vitest)
  in a Stencil mock-DOM environment.
- **Stencil E2E tests** run in a real Chromium browser via
  [`@vitest/browser-playwright`](https://vitest.dev/guide/browser/).
- **Storybook tests** run via
  [`@storybook/addon-vitest`](https://storybook.js.org/docs/writing-tests) with integrated
  accessibility checks.

### Running Tests

```bash
npm test                      # runs ALL tests with coverage
```

This runs three test suites in sequence:

1. **Stencil spec tests** -- unit and component tests in a mock-DOM environment
2. **Stencil E2E tests** -- component tests in a real Chromium browser via Playwright
3. **Storybook tests** (`vitest run --project=storybook`) -- renders every story in headless
   Chromium and runs `play()` functions and accessibility audits

From `packages/stencil-library` you can also run subsets:

```bash
npm run test:spec             # spec tests only (node DOM)
npm run test:e2e              # E2E tests only (real browser)
npm run test:watch            # watch mode (no coverage)
```

A V8 coverage report is generated automatically on every test run (except in watch mode).
Coverage output is available as text in the terminal and as HTML in `packages/stencil-library/coverage/`.

> Storybook tests require Playwright with Chromium. Install with:
> `npx playwright install --with-deps chromium`

### Writing Tests

**Spec tests** (`*.spec.ts` / `*.spec.tsx`) test pure logic and component rendering in a node DOM:

```tsx
import { render, h } from '@stencil/vitest';
import { describe, it, expect } from 'vitest';

describe('my-component', () => {
  it('renders with value', async () => {
    const { root } = await render(<my-component value="test" />);
    expect(root).toBeTruthy();
    expect(root.value).toBe('test');
  });
});
```

**E2E tests** (`*.e2e.tsx`) run in a real browser:

```tsx
import { render, h } from '@stencil/vitest';
import { describe, it, expect } from 'vitest';

describe('my-component e2e', () => {
  it('renders and hydrates', async () => {
    const { root } = await render(<my-component value="test" />);
    expect(root).toHaveClass('hydrated');
  });
});
```

## Continuous Integration

### npm-ci.yml

Runs on every push and pull request. Tests against Node.js 22 (LTS) and 24 (current):

1. `npm ci` -- install dependencies
2. `npx playwright install --with-deps chromium` -- install browser for E2E and Storybook tests
3. `npx lerna run build` -- build all packages
4. `npx lerna run lint` -- ESLint
5. `npx lerna run format:check` -- Prettier
6. `npm run build-storybook` -- build static Storybook
7. `npm test` -- runs all tests (Stencil spec + E2E + Storybook) with coverage

On pull requests, a coverage summary is posted as a comment. On pushes to `main`, a coverage
badge is updated automatically.

### deploy-storybook.yml

Runs on pushes to `main`. Builds all packages and the composed Storybook, then deploys the static
output to [GitHub Pages](https://kit-data-manager.github.io/pid-component/).

### chromatic.yml

Runs on every push and pull request. Uploads the main Web Components Storybook to
[Chromatic](https://www.chromatic.com/) for visual regression testing. Changes on `main` are
auto-accepted.

## Deployment

### Storybook

The production Storybook is deployed to GitHub Pages at
**https://kit-data-manager.github.io/pid-component/**. It is rebuilt and redeployed automatically
on every push to `main` via the `deploy-storybook.yml` workflow.

The deployed Storybook includes the main Web Components stories plus the composed React (Vite),
React (Next.js), Vue, and Angular sub-Storybooks (accessible via the sidebar).

### npm Packages

The npm packages are published independently (Lerna independent versioning). To publish:

```bash
npx lerna publish
```

### Chromatic

[Chromatic](https://www.chromatic.com/) provides visual regression testing and a hosted Storybook
preview for each PR. It runs automatically via `chromatic.yml` on every push and pull request.
