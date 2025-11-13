import React from 'react';
import SourceData from './components/source-data';
import ElTable from './components/el-table';
import DataCatalogProvider from './components/DataCatalogProvider';
import './list.css';

const DataCatalog: React.FC = () => {
  return (
    <DataCatalogProvider>
      <div className="h-full w-full py-5 pr-5">
        <div className="box-border h-full w-full rounded-2xl bg-white pb-[20px] pl-[24px] pr-6 pt-[20px]">
          <div className="mb-4 h-[30px] w-full leading-[30px]">
            <p className="text-xl font-bold">数据目录</p>
          </div>
          <div className="flex w-full" style={{ height: 'calc(100% - 43px)' }}>
            <SourceData />
            <ElTable />
          </div>
        </div>
      </div>
    </DataCatalogProvider>
  );
};

export default DataCatalog;
