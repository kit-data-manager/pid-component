export const DOI_examples = {
  VALID_BARE: '10.52825/ocp.v5i.1411',
  VALID_WITH_PREFIX: 'https://dx.doi.org/10.52825/ocp.v5i.1411',
  DATACITE_JOURNAL_PAPER: '10.52825/ocp.v5i.1411',
  CROSSREF_JOURNAL_PAPER: '10.1109/eScience65000.2025.00022',
  DATACITE_SOFTWARE: 'https://doi.org/10.5281/zenodo.13629109',
  DATACITE_RFC: 'doi:10.17487/rfc3650',
  CROSSREF_BOOK: '10.1007/978-1-4419-8598-9',
  DATACITE_SLIDES: '10.5445/IR/1000178054',
  DATACITE_PREPRINT: '10.48550/ARXIV.2505.16550',
  INVALID_NOT_A_DOI: 'not-a-doi',
  INVALID_EMPTY: '',
} as const;

export type DOI_example = typeof DOI_examples[keyof typeof DOI_examples];
