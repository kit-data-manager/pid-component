import { addons } from 'storybook/manager-api';
import KITTheme from './KITTheme';

addons.setConfig({
  theme: KITTheme,
  panelPosition: 'bottom',
  enableShortcuts: true,
  showToolbar: true,
  sidebar: {
    showRoots: true,
  },
  layout: {
    showNav: true,
    showPanels: true,
    showToolbar: true,
  },
});
