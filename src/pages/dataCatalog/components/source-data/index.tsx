import React, { useEffect } from 'react';
import { Tabs } from '@arco-design/web-react';
import './tabs-center.css';
import EditableTree from '../editable-tree';
import { useDataCatalog } from '../DataCatalogProvider/Context';
import { CatalogTypeEnum, RootTypeEnum, tabKeys } from '../../consts';

const TabPane = Tabs.TabPane;

export default function SourceData() {
  const dataCatalog = useDataCatalog();
  const { catalogTreeStore } = dataCatalog;
  const { activeTab } = catalogTreeStore.useGetState(['activeTab']);

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

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    catalogTreeStore.getEffect('fetchData')({
      activeTab: value
    });
  };

  return (
    <div className="mr-[8px] w-[220px] overflow-auto rounded border border-solid border-[#E2E8F0]">
      <div className="h-[40px] w-full">
        <Tabs
          activeTab={activeTab}
          onChange={(e) => handleTabChange(e)}
          className="tabs-center"
        >
          {tabKeys.map((tab) => (
            <TabPane key={tab.key} title={tab.title}>
              <EditableTree />
            </TabPane>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
