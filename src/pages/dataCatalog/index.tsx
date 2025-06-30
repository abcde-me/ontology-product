import React from 'react';
import './index.css';
import SourceData from './components/source-data';
import Eltable from './components/el-table';
import DataCatalogProvider from './components/DataCatalogProvider';

const DataCatalog: React.FC = () => {
  const [active, setActive] = React.useState('source');
  const [selectedNode, setSelectedNode] = React.useState('');

  // 处理标签页切换
  const handleTabChange = (tabValue: string) => {
    setActive(tabValue);
  };

  // 处理树节点选择
  const handleNodeSelect = (nodeKey: string) => {
    setSelectedNode(nodeKey);
  };

  return (
    <DataCatalogProvider>
      <div className="h-full w-full py-5 pr-5">
        <div className="box-border h-full w-full rounded-2xl bg-white pb-[27px] pl-4 pr-6 pt-6">
          <div className="mb-4 h-[30px] w-full leading-[30px]">
            <p style={{ fontSize: '20px', fontWeight: 500 }}>数据集目录</p>
          </div>
          <div className="flex w-full" style={{ height: 'calc(100% - 43px)' }}>
            <SourceData
            // onTabChange={handleTabChange}
            // onNodeSelect={handleNodeSelect}
            // activeTab={active}
            />
            <Eltable active={active} selectedNode={selectedNode} />
          </div>
        </div>
      </div>
    </DataCatalogProvider>
  );
};

export default DataCatalog;
