import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';
import { angularOutputTarget } from '@stencil/angular-output-target';
import { webTypesOutputTarget } from '@stencil-community/web-types-output-target';
import { postcss } from '@stencil-community/postcss';
import tailwindcss from '@tailwindcss/postcss';
import cssnanoPlugin from 'cssnano';
import { codecovRollupPlugin } from '@codecov/rollup-plugin';

export const config: Config = {
  namespace: 'pid-component',
  globalStyle: 'src/tailwind.css',
  outputTargets: [
    {
      type: 'dist',
    },
    {
      type: 'dist-hydrate-script',
      dir: './hydrate',
    },
    reactOutputTarget({
      outDir: '../react-library/lib/components/stencil-generated/',
      hydrateModule: '@kit-data-manager/pid-component/hydrate',
      clientModule: '@kit-data-manager/react-pid-component',
    }),
    vueOutputTarget({
      componentCorePackage: '@kit-data-manager/pid-component',
      proxiesFile: '../vue-library/lib/components.ts',
    }),
    angularOutputTarget({
      componentCorePackage: '@kit-data-manager/pid-component',
      outputType: 'standalone',
      directivesProxyFile: '../angular-library/lib/stencil-generated/components.ts',
      directivesArrayFile: '../angular-library/lib/stencil-generated/index.ts',
    }),
    {
      type: 'dist-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [{ src: '**/*.html' }, { src: '**/*.css' }],
    },
    webTypesOutputTarget(),
  ],
  plugins: [
    postcss({
      plugins: [
        tailwindcss(),
        cssnanoPlugin(),
      ],
    }),
  ],
  rollupPlugins: {
    after: [
      codecovRollupPlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
        bundleName: 'stencil-library',
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
  },
  sourceMap: true,
  extras: {
    experimentalSlotFixes: true,
  },
  preamble:
    '\n' +
    'Copyright 2024-2026 Karlsruhe Institute of Technology.\n' +
    '\n' +
    'Licensed under the Apache License, Version 2.0 (the "License");\n' +
    'you may not use this file except in compliance with the License.\n' +
    'You may obtain a copy of the License at\n' +
    '\n' +
    '      https://www.apache.org/licenses/LICENSE-2.0\n' +
    '\n' +
    'Unless required by applicable law or agreed to in writing, software\n' +
    'distributed under the License is distributed on an "AS IS" BASIS,\n' +
    'WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n' +
    'See the License for the specific language governing permissions and\n' +
    'limitations under the License.\n',
};
