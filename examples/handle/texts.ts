import { HANDLE_examples } from './values';

export const handle_texts = {
  BASIC: `Handle ${HANDLE_examples.FDO_BARE}`,
  FDO_REFERENCE: `FDO: ${HANDLE_examples.FDO_TYPED}`,
  TYPED_PID_REFERENCE: `Typed PID Maker: ${HANDLE_examples.FDO_TYPED}`,
  IN_TEXT: `This dataset is published as a FAIR Digital Object at ${HANDLE_examples.FDO_TYPED}.`,
} as const;

export type handle_text = typeof handle_texts[keyof typeof handle_texts];