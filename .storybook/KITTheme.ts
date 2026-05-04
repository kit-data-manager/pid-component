import { create } from 'storybook/theming';

export default create({
  base: 'dark',
  fontBase: '"Arial", sans-serif',
  brandTitle: 'Karlsruhe Institute of Technology',
  brandUrl: 'https://kit-data-manager.github.io/pid-component',
  brandImage: 'https://kit-data-manager.github.io/metadata-management-cookbook/kit_logo_en_white.svg',
  brandTarget: '_self',

  colorPrimary: '#4664AA',
  colorSecondary: '#00876C',

  appBg: '#2b2b2b',
  appContentBg: '#323232',
  appPreviewBg: '#383838',
  appBorderColor: '#00876C',
  appBorderRadius: 4,

  textColor: '#f0f0f0',
  textInverseColor: '#404040',

  barTextColor: '#b0b0b0',
  barSelectedColor: '#00876C',
  barHoverColor: '#00876C',
  barBg: '#262626',

  inputBg: '#262626',
  inputBorder: '#00876C',
  inputTextColor: '#f0f0f0',
  inputBorderRadius: 2,
});
