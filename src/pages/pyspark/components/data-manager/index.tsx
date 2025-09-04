import React, { useState } from 'react';
import { Typography } from '@arco-design/web-react';
import DataDirectoryTree from '@/components/data-directory-tree';
import ModalDatasetDetail from './ModalDatasetDetail';
import { DatasetListItem } from '@/types/datasetManagement';
import './index.scss';
import ModalVolumnDetail from './ModalVolumnDetail';
import { Db, FluffyVolume } from '@/api/dataCatalog';

const { Title } = Typography;

const PythonTabContent: React.FC<{}> = () => {
  const [datasetDetailVisible, setDatasetDetailVisible] = useState(false);
  const [detailId, setDetailId] = useState('');
  const [volumnDetailVisible, setVolumnDetailVisible] = useState(false);
  const [selectedVolumnId, setSelectedVolumnId] = useState('');

  const closeDatasetDetail = () => {
    setDatasetDetailVisible(false);
  };

  const closeVolumnDetail = () => {
    setVolumnDetailVisible(false);
  };

  // 处理数据集详情查看
  const handleViewDatasetDetail = (dataset: DatasetListItem) => {
    setDetailId(String(dataset.id));
    setDatasetDetailVisible(true);
  };

  // 处理数据集插入
  const handleInsertDataset = (dataset: DatasetListItem) => {
    console.log('数据集插入:', dataset);
    // 这里可以添加插入数据集的逻辑
    // 比如将数据集添加到代码编辑器中或执行其他插入操作
  };

  // 处理数据卷详情查看
  const handleViewVolumeDetail = (volume: FluffyVolume) => {
    console.log('数据卷详情:', volume);
    setSelectedVolumnId(String(volume.id));
    setVolumnDetailVisible(true);
  };

  // 处理数据库详情查看
  const handleViewDbDetail = (database: Db) => {
    console.log('数据库详情:', database);
    // 这里可以添加显示数据库详情的逻辑
    // 比如打开数据库详情的模态框
  };

  return (
    <div className="python-tab-content sider-container">
      <div className="sider-title">数据目录</div>

      <div className="tab-tree">
        <DataDirectoryTree
          onViewDatasetDetail={handleViewDatasetDetail}
          onInsertDataset={handleInsertDataset}
          onViewVolumeDetail={handleViewVolumeDetail}
          onViewDbDetail={handleViewDbDetail}
        />
      </div>

      {/* 数据集详情 */}
      <ModalDatasetDetail
        datasetDetailVisible={datasetDetailVisible}
        detailId={detailId}
        closeDatasetDetail={closeDatasetDetail}
      />

      {/* 数据卷详情 */}
      <ModalVolumnDetail
        volumnDetailVisible={volumnDetailVisible}
        selectedVolumnId={selectedVolumnId}
        closeVolumnDetail={closeVolumnDetail}
      />
    </div>
  );
};

export default PythonTabContent;
