import { SPDX_examples } from './values';

export const spdx_texts = {
  BASIC: `License ${SPDX_examples.APACHE_2_0}`,
  IN_CONTEXT: `Available under ${SPDX_examples.APACHE_2_0}.`,
  BARE: `Available under ${SPDX_examples.APACHE_2_0_BARE}.`,
  CC_LICENSE: `Creative Commons license ${SPDX_examples.CC_BY_4_0}.`,
} as const;

export type spdx_text = typeof spdx_texts[keyof typeof spdx_texts];