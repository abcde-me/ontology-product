import React, { useState } from 'react';
import { Message, Typography } from '@arco-design/web-react';
import DataDirectoryTree from '@/components/data-directory-tree';
import { DatasetListItem } from '@/types/datasetManagement';
import './index.scss';
import { Db } from '@/api/dataCatalog';
import { DataDirectoryTreeFrom } from '@/components/data-directory-tree/types';
import ModalDbDetail from './ModalDbDetail';
import ModalDatasetDetail from './ModalDatasetDetail';
import copy from 'copy-to-clipboard';

const { Title } = Typography;

interface DataManagerProps {
  onInsertContent?: (content: string) => void;
  getIsEditorFocused?: () => boolean;
}

const PythonTabContent: React.FC<DataManagerProps> = ({
  onInsertContent,
  getIsEditorFocused
}) => {
  const [dbDetailVisible, setDbDetailVisible] = useState(false);
  const [selectedDbId, setSelectedDbId] = useState('');
  const [datasetDetailVisible, setDatasetDetailVisible] = useState(false);
  const [detailId, setDetailId] = useState('');

  const closeDbDetail = () => {
    setDbDetailVisible(false);
  };

  // 处理数据集插入
  const handleInsertDataset = (dataset: DatasetListItem) => {
    const isEditorFocused = getIsEditorFocused?.() ?? false;
    console.log(
      '数据集插入:',
      dataset,
      'isEditorFocused:',
      isEditorFocused,
      'onInsertContent:',
      onInsertContent
    );

    if (isEditorFocused && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(dataset?.name ?? '');
    } else {
      // 编辑器未聚焦时复制到剪贴板
      copy(dataset?.name ?? '');
      Message.success('内容复制成功，请粘贴到编辑器');
    }
  };

  const closeDatasetDetail = () => {
    setDatasetDetailVisible(false);
  };

  // 处理数据集详情查看
  const handleViewDatasetDetail = (dataset: DatasetListItem) => {
    setDetailId(String(dataset.id));
    setDatasetDetailVisible(true);
  };

  // 处理数据库详情查看
  const handleViewDbDetail = (database: Db, hierarchyData?: any) => {
    console.log('数据库详情:', database);
    console.log('层级选择数据:', hierarchyData);
    setSelectedDbId(String(database.id));
    setDbDetailVisible(true);
  };

  // 处理数据库插入
  const handleDbInsert = (database: Db, hierarchyData?: any) => {
    const isEditorFocused = getIsEditorFocused?.() ?? false;
    console.log('数据库插入:', database, 'isEditorFocused:', isEditorFocused);
    console.log('层级选择数据:', hierarchyData);

    if (isEditorFocused && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(database?.name ?? '');
    } else {
      // 编辑器未聚焦时复制到剪贴板
      copy(database?.name ?? '');
      Message.success('内容复制成功，请粘贴到编辑器');
    }
  };

  return (
    <div className="python-tab-content">
      <div className="tab-header">
        <Title className="tab-title">数据目录</Title>
      </div>

      <div className="tab-tree sider-container">
        <DataDirectoryTree
          from={DataDirectoryTreeFrom.SQL}
          // 数据集插入
          onInsertDataset={handleInsertDataset}
          // 数据集详情
          onViewDatasetDetail={handleViewDatasetDetail}
          // 数据库详情
          onViewDbDetail={handleViewDbDetail}
          // 数据库插入
          onDbInsert={handleDbInsert}
          getIsEditorFocused={getIsEditorFocused}
        />
      </div>

      {/* 数据集详情 */}
      {datasetDetailVisible && (
        <ModalDatasetDetail
          datasetDetailVisible={datasetDetailVisible}
          detailId={detailId}
          closeDatasetDetail={closeDatasetDetail}
        />
      )}

      {/* 数据库详情 */}
      {dbDetailVisible && (
        <ModalDbDetail
          dbDetailVisible={dbDetailVisible}
          selectedDbId={selectedDbId}
          closeDbDetail={closeDbDetail}
        />
      )}
    </div>
  );
};

export default PythonTabContent;
