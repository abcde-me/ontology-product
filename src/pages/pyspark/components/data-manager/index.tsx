import React, { useState } from 'react';
import { Message, Typography } from '@arco-design/web-react';
import DataDirectoryTree from '@/components/pyspark-data-directory-tree';
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
  getIsEditorFocused?: () => boolean;
}

const PythonTabContent: React.FC<PythonTabContentProps> = ({
  onInsertContent,
  getIsEditorFocused
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
    const isEditorFocusedNow = getIsEditorFocused?.() ?? false;
    const fileKey = dataset?.file_key ?? '';
    if (!fileKey) {
      Message.warning('内容为空');
      return;
    }
    console.log('数据集插入:', dataset);

    if (isEditorFocusedNow && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(fileKey);
    } else {
      const isSuccess = copy(String(fileKey));

      if (isSuccess) {
        Message.success('内容复制成功，请粘贴到编辑器');
      } else {
        Message.error('内容复制失败');
      }
    }
  };

  // 处理数据卷插入或复制
  const handleVolumeInsert = (volume: FluffyVolume) => {
    const isEditorFocusedNow = getIsEditorFocused?.() ?? false;
    const fileUuid = volume?.file_uuid ?? '';
    console.log('数据卷插入:', volume);

    if (!fileUuid) {
      Message.warning('内容为空');
      return;
    }

    if (isEditorFocusedNow && onInsertContent) {
      // 编辑器聚焦时插入内容
      onInsertContent(String(fileUuid));
    } else {
      // 编辑器未聚焦时复制到剪贴板
      const isSuccess = copy(String(fileUuid));

      if (isSuccess) {
        Message.success('内容复制成功，请粘贴到编辑器');
      } else {
        Message.error('内容复制失败');
      }
    }
  };

  // 处理数据卷详情查看
  const handleViewVolumeDetail = (
    rootType: 'source' | 'target',
    volume: FluffyVolume
  ) => {
    setSelectedVolumn(volume);
    rootType === 'source'
      ? setSourceVolumnDetailVisible(true)
      : setTargetVolumnDetailVisible(true);
  };

  // 处理数据库详情查看
  const handleViewDbDetail = (database: Db, hierarchyData?: any) => {
    console.log('数据库详情:', database);
    console.log('层级选择数据:', hierarchyData);
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
