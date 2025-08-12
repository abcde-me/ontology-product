import { useCreation } from 'ahooks';
import React, { useEffect } from 'react';
import { DataCatalog } from './DataCatalog';
import { DataCatalogContext } from './Context';

interface DataCatalogProviderProps {
  children: React.ReactNode | React.ReactNode[];
  dataCatalogStore?: DataCatalog;
}

const DataCatalogProvider = ({
  children,
  dataCatalogStore
}: DataCatalogProviderProps) => {
  const dataCatalog = useCreation(() => {
    if (dataCatalogStore) {
      return dataCatalogStore;
    }
    return new DataCatalog();
  }, [dataCatalogStore]);

  return (
    <DataCatalogContext.Provider value={dataCatalog}>
      {children}
    </DataCatalogContext.Provider>
  );
};

export default DataCatalogProvider;
