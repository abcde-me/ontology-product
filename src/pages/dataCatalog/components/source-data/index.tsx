import React, { useEffect } from 'react';
import './tabs-center.css';
import EditableTree from '../editable-tree';
import { useDataCatalog } from '../DataCatalogProvider/Context';
import { CatalogTypeEnum, RootTypeEnum, tabKeys } from '../../consts';

export default function SourceData() {
  const dataCatalog = useDataCatalog();
  const { catalogTreeStore } = dataCatalog;

  const params = new URLSearchParams(window.location.search);
  const root_type = params.get('root_type');
  const parent_id = params.get('parent_id');
  const id = params.get('id');

  useEffect(() => {
    let activeKey = 'src';
    if (root_type && root_type === String(RootTypeEnum.dst)) {
      activeKey = 'dst';
    }

    catalogTreeStore.getEffect('fetchData')({
      activeTab: activeKey,
      parent_id: parent_id || undefined,
      id: id || undefined
    });
  }, [root_type, parent_id, id]);

  return (
    <div className="data-catalog-left-box mr-[16px] w-[260px] overflow-auto">
      <div className="h-[40px] w-full">
        <EditableTree />
      </div>
    </div>
  );
}
