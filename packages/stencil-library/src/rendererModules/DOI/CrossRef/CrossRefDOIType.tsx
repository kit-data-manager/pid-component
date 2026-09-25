import { DOIType, crossRefProvider, RendererSettings } from '../DOIType';

/**
 * DOI renderer for CrossRef metadata, including funder handling.
 */
export class CrossRefDOIType extends DOIType {
  constructor(value: string, settings?: RendererSettings) {
    super(value, settings, crossRefProvider);
  }
}
