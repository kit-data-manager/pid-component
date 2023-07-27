import { Config } from '@stencil/core';
import tailwind, {tailwindHMR} from "stencil-tailwind-plugin";

export const config: Config = {
  namespace: 'pidcomponent',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'docs-vscode',
      file: 'vscode-data.json',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    browserHeadless: "new",
  },
  plugins: [
    tailwind(),
    tailwindHMR(),
  ],
};
