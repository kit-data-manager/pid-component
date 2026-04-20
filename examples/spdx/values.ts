export const SPDX_examples = {
  APACHE_2_0: 'https://spdx.org/licenses/Apache-2.0',
  APACHE_2_0_BARE: 'Apache-2.0',
  MIT: 'https://spdx.org/licenses/MIT',
  MIT_BARE: 'MIT',
  CC_BY_4_0: 'https://spdx.org/licenses/CC-BY-4.0',
  CC_BY_4_0_BARE: 'CC-BY-4.0',
  INVALID_LICENSE_NAME: 'Apache License 2.0',
  INVALID_NOT_SPdx: 'https://example.com/licenses/MIT',
  INVALID_LICENSE: 'INVALID-LICENSE',
  INVALID_EMPTY: '',
} as const;

export type SPDX_example = typeof SPDX_examples[keyof typeof SPDX_examples];