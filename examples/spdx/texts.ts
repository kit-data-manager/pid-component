import { SPDX_examples } from './values';

export const spdx_texts = {
  BASIC: `License ${SPDX_examples.APACHE_2_0}`,
  IN_CONTEXT: `Available under ${SPDX_examples.APACHE_2_0}.`,
  BARE: `Available under ${SPDX_examples.APACHE_2_0_BARE}.`,
  CC_LICENSE: `Creative Commons license ${SPDX_examples.CC_BY_4_0}.`,
  INVALID_TEXT: `Software licensed under ${SPDX_examples.INVALID_LICENSE_NAME} is used.`,
  INVALID_TEXT_WITH_VALID: `License ${SPDX_examples.APACHE_2_0} (valid) and invalid license: ${SPDX_examples.INVALID_LICENSE} in use.`,
} as const;

export type spdx_text = typeof spdx_texts[keyof typeof spdx_texts];