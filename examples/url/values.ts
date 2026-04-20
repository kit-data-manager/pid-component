export const URL_examples = {
  KIT_WEBSITE: 'https://scc.kit.edu',
  GITHUB: 'https://github.com/kit-data-manager/pid-component',
  ZENODO: 'https://zenodo.org',
} as const;

export type URL_example = typeof URL_examples[keyof typeof URL_examples];