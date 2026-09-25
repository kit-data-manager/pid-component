import { DOIType, dataCiteProvider, RendererSettings } from '../DOIType';

/**
 * DOI renderer for DataCite metadata.
 */
export class DataCiteDOIType extends DOIType {
  constructor(value: string, settings?: RendererSettings) {
    super(value, settings, dataCiteProvider);
  }
}
