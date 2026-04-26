// Storybook 10.3's @storybook/addon-vitest automatically provisions
// project annotations. We only need to register custom elements from the
// built Stencil dist and configure preview parameters.
//
// The framework renderer (web-components) is registered by the addon
// when it detects the framework in .storybook/main.ts.

import '../packages/stencil-library/dist/pid-component/pid-component.esm.js';
