# PID Component

[![CodeQL](https://github.com/kit-data-manager/pid-component/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/kit-data-manager/pid-component/actions/workflows/github-code-scanning/codeql)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.13629109.svg)](https://doi.org/10.5281/zenodo.13629109)

The `pid-component` is an easily extensible web component that can be used to display PIDs, ORCiDs, and possibly other
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
via [unpkg](https://unpkg.com/):

```html
<head>
  <script type="module" src="https://unpkg.com/@kit-data-manager/pid-component"></script>
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

You can try this web component in the [demo](https://kit-data-manager.github.io/pid-component).

**Only use the `pid-component` component! All the others are just for prototyping...**

There are detailed docs for the `pid-component` component
available [in the Storybook](https://kit-data-manager.github.io/pid-component) and in
the [source code](packages/stencil-library/src/components/pid-component/readme.md).

**Please notice that you must use the hyphenated version of an attribute when using the component directly in HTML (
e.g. `currentLevelOfSubcomponents` -> `current-level-of-subcomponents`).
When using inside Stencil or with JSX/TSX syntax, you must use the camelCase version.**

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
