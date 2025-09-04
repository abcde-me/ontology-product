import React, { useState } from 'react';
import { Typography } from '@arco-design/web-react';
import DataDirectoryTree from '@/components/data-directory-tree';
import ModalDatasetDetail from './ModalDatasetDetail';
import { DatasetListItem } from '@/types/datasetManagement';
import './index.scss';
import { Db } from '@/api/dataCatalog';
import { DataDirectoryTreeFrom } from '@/components/data-directory-tree/types';
import ModalDbDetail from './ModalDbDetail';

const { Title } = Typography;

const PythonTabContent: React.FC<{}> = () => {
  const [datasetDetailVisible, setDatasetDetailVisible] = useState(false);
  const [detailId, setDetailId] = useState('');
  const [dbDetailVisible, setDbDetailVisible] = useState(false);
  const [selectedDbId, setSelectedDbId] = useState('');

  const closeDatasetDetail = () => {
    setDatasetDetailVisible(false);
  };

  const closeDbDetail = () => {
    setDbDetailVisible(false);
  };

  // 处理数据集详情查看
  const handleViewDatasetDetail = (dataset: DatasetListItem) => {
    console.log('数据集详情:', dataset);
    setDetailId(String(dataset.id));
    setDatasetDetailVisible(true);
  };

  // 处理数据集插入
  const handleInsertDataset = (dataset: DatasetListItem) => {
    console.log('数据集插入:', dataset);
    // 这里可以添加插入数据集的逻辑
    // 比如将数据集添加到代码编辑器中或执行其他插入操作
  };

  // 处理数据库详情查看
  const handleViewDbDetail = (database: Db) => {
    console.log('数据库详情:', database);
    setSelectedDbId(String(database.id));
    setDbDetailVisible(true);
  };

  // 处理数据库插入
  const handleDbInsert = (database: Db) => {
    console.log('数据库插入:', database);
    // 这里可以添加插入数据库的逻辑
    // 比如将数据库添加到代码编辑器中或执行其他插入操作
  };

  return (
    <div className="python-tab-content">
      <div className="tab-header">
        <Title className="tab-title">数据目录</Title>
      </div>

      <div className="tab-tree">
        <DataDirectoryTree
          from={DataDirectoryTreeFrom.SQL}
          // 数据集详情
          onViewDatasetDetail={handleViewDatasetDetail}
          // 数据集插入
          onInsertDataset={handleInsertDataset}
          // 数据库详情
          onViewDbDetail={handleViewDbDetail}
          // 数据库插入
          onDbInsert={handleDbInsert}
        />
      </div>

      {/* 数据集详情 */}
      <ModalDatasetDetail
        datasetDetailVisible={datasetDetailVisible}
        detailId={detailId}
        closeDatasetDetail={closeDatasetDetail}
      />

      {/* 数据库详情 */}
      <ModalDbDetail
        dbDetailVisible={dbDetailVisible}
        selectedDbId={selectedDbId}
        closeDbDetail={closeDbDetail}
      />
    </div>
  );
};

export default PythonTabContent;
