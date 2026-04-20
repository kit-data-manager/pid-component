import { DOI_examples } from './values';

export const doi_texts = {
  BASIC: `DOI ${DOI_examples.DATACITE_JOURNAL_PAPER} was published in 2024.`,
  WITH_METADATA: `Published in IEEE eScience. See DOI ${DOI_examples.CROSSREF_JOURNAL_PAPER}.`,
  IN_CONTEXT: `This dataset is published at DOI ${DOI_examples.DATACITE_JOURNAL_PAPER}.`,
  SOFTWARE_REFERENCE: `The software is available at ${DOI_examples.DATACITE_SOFTWARE}.`,
  BOOK_CITATION: `Reference: ${DOI_examples.CROSSREF_BOOK}`,
  PREPRINT_CITATION: `Preprint available at ${DOI_examples.DATACITE_PREPRINT}.`,
} as const;

export type doi_text = typeof doi_texts[keyof typeof doi_texts];