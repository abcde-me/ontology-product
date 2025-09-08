import React, { useState } from 'react';
import { Message, Typography } from '@arco-design/web-react';
import DataDirectoryTree from '@/components/data-directory-tree';
import ModalDatasetDetail from './ModalDatasetDetail';
import { DatasetListItem } from '@/types/datasetManagement';
import './index.scss';
import ModalSourceVolumnDetail from './ModalSourceVolumnDetail';
import ModalTargetVolumnDetail from './ModalTargetVolumnDetail';
import { Db, FluffyVolume } from '@/api/dataCatalog';
import copy from 'copy-to-clipboard';

const { Title } = Typography;

interface PythonTabContentProps {
  onInsertContent?: (content: string) => void;
  isEditorFocused?: boolean;
}

const PythonTabContent: React.FC<PythonTabContentProps> = ({
  onInsertContent,
  isEditorFocused = false
}) => {
  const [datasetDetailVisible, setDatasetDetailVisible] = useState(false);
  const [detailId, setDetailId] = useState('');
  const [sourceVolumnDetailVisible, setSourceVolumnDetailVisible] =
    useState(false);
  const [targetVolumnDetailVisible, setTargetVolumnDetailVisible] =
    useState(false);
  const [selectedVolumn, setSelectedVolumn] = useState<FluffyVolume | null>(
    null
  );

  const closeDatasetDetail = () => {
    setDatasetDetailVisible(false);
  };

  const closeSourceVolumnDetail = () => {
    setSourceVolumnDetailVisible(false);
  };

  const closeTargetVolumnDetail = () => {
    setTargetVolumnDetailVisible(false);
  };

  // 处理数据集详情查看
  const handleViewDatasetDetail = (dataset: DatasetListItem) => {
    setDetailId(String(dataset.id));
    setDatasetDetailVisible(true);
  };

  // 处理数据集插入或复制
  const handleInsertDataset = (dataset: DatasetListItem) => {
    console.log('数据集插入:', dataset, isEditorFocused, onInsertContent);

    if (isEditorFocused && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(dataset.name ?? '');
    } else {
      // 编辑器未聚焦时复制到剪贴板
      copy(dataset.name ?? '');
      Message.success('内容复制成功，请粘贴到编辑器');
    }
  };

  // 处理数据卷插入或复制
  const handleVolumeInsert = (volume: FluffyVolume) => {
    console.log('数据卷插入:', volume);

    if (isEditorFocused && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(volume?.name ?? '');
    } else {
      // 编辑器未聚焦时复制到剪贴板
      copy(volume?.name ?? '1111');
      Message.success('内容复制成功，请粘贴到编辑器');
    }
  };

  // 处理数据卷详情查看
  const handleViewVolumeDetail = (
    rootType: 'source' | 'target',
    volume: FluffyVolume
  ) => {
    console.log('数据卷详情:', volume);
    setSelectedVolumn(volume);
    rootType === 'source'
      ? setSourceVolumnDetailVisible(true)
      : setTargetVolumnDetailVisible(true);
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
          onVolumeInsert={handleVolumeInsert}
          onViewDatasetDetail={handleViewDatasetDetail}
          onInsertDataset={handleInsertDataset}
          onViewVolumeDetail={handleViewVolumeDetail}
          onViewDbDetail={handleViewDbDetail}
          onInsertContent={onInsertContent}
          isEditorFocused={isEditorFocused}
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

      {/* 源数据卷详情 */}
      {sourceVolumnDetailVisible && (
        <ModalSourceVolumnDetail
          volumnDetailVisible={sourceVolumnDetailVisible}
          selectedVolumn={selectedVolumn}
          closeVolumnDetail={closeSourceVolumnDetail}
        />
      )}

      {/* 目标数据卷详情 */}
      {targetVolumnDetailVisible && (
        <ModalTargetVolumnDetail
          volumnDetailVisible={targetVolumnDetailVisible}
          selectedVolumn={selectedVolumn}
          closeVolumnDetail={closeTargetVolumnDetail}
        />
      )}
    </div>
  );
};

export default PythonTabContent;
