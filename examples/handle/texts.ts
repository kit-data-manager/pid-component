import { HANDLE_examples } from './values';

export const handle_texts = {
  BASIC: `Handle ${HANDLE_examples.FDO_BARE}`,
  FDO_REFERENCE: `FDO: ${HANDLE_examples.FDO_TYPED}`,
  TYPED_PID_REFERENCE: `Typed PID Maker: ${HANDLE_examples.FDO_TYPED}`,
  IN_TEXT: `This dataset is published as a FAIR Digital Object at ${HANDLE_examples.FDO_TYPED}.`,
  INVALID_TEXT: `Dataset ${HANDLE_examples.INVALID_NO_SUFFIX} was referenced but no suffix provided.`,
  INVALID_TEXT_WITH_VALID: `Handle ${HANDLE_examples.FDO_TYPED} and invalid handle: ${HANDLE_examples.INVALID_NOT_A_PID} both in text.`,
} as const;

export type handle_text = typeof handle_texts[keyof typeof handle_texts];