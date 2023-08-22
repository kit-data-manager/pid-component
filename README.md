# PID Component
[![CodeQL](https://github.com/kit-data-manager/pid-component/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/kit-data-manager/pid-component/actions/workflows/github-code-scanning/codeql)

The PID-Component is a web component that can be used to display PIDs, ORCiDs, and possibly other identifiers in a user-friendly way.
It is easily extensible to support other identifier types.

To use the component, import the package via [unpkg](https://unpkg.com/):
```html
<head>
  <script type="module" src="https://unpkg.com/@kit-data-manager/pid-component"></script>
</head>
```
Alternatively you can install the package via npm:
```bash
npm install @kit-data-manager/pid-component
```
Then, you can use this component like this:
```html
<display-magic value="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6"></display-magic>
```
You can try this web component in the [demo](https://kit-data-manager.github.io/pid-component/?path=/docs/display-magic--docs).

**Only use the `display-magic` component! All the others are just for prototyping...**

TODO: Add more information

## How to run when developing

1. Clone the repo
2. Run `npm install`

For running storybook in dev mode, run theses commands in separate terminals:

- `npm run buildWatch`
- `npm run storybook`

Attention: Do **NOT** run `npm run start`. It will cause the storybook to not work properly.
If you did run `npm run start`, delete the following folders and run `npm install` again:

- `node_modules`
- `www`
- `dist`
- `loader`
- `.stencil`
