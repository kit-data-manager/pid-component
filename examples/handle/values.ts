export const HANDLE_examples = {
  FDO_TYPED: '21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6',
  FDO_BARE: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
  FDO_WITH_HTTPS: 'https://hdl.handle.net/21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6',
} as const;

export type HANDLE_example = typeof HANDLE_examples[keyof typeof HANDLE_examples];