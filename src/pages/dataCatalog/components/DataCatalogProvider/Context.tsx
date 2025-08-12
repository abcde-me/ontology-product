import { createContext, useContext } from 'react';
import { DataCatalog } from './DataCatalog';

export const DataCatalogContext = createContext<DataCatalog | null>(null);

export function useDataCatalog() {
  return useContext(DataCatalogContext)!;
}
