import React, { useState } from 'react';
import { Tree } from '@arco-design/web-react';
import DataCollection from './components/daset-tree';
import SourceTree from './components/source-tree';
import TargetTree from './components/target-tree';
import FileIcon from './assets/file-icon.svg';
import { DatasetListItem } from '@/types/datasetManagement';
import './index.scss';
import { Db, FluffyVolume } from '@/api/dataCatalog';
import { useHasPermission } from '@/store/userInfoStore';
import { PYSPARK_PERMISSIONS } from '@/config/permissions';

// 数据目录配置数组
const directoryItems = [
  {
    id: 'dataset',
    label: '数据集',
    icon: 'folder'
  },
  {
    id: 'source',
    label: '源数据目录',
    icon: 'folder'
  },
  {
    id: 'target',
    label: '目标数据目录',
    icon: 'folder'
  }
];

interface DataDirectoryTreeProps {
  onViewDatasetDetail?: (dataset: DatasetListItem) => void;
  onInsertDataset?: (dataset: DatasetListItem) => void;
  onViewVolumeDetail?: (
    dataType: 'source' | 'target',
    volume: FluffyVolume
  ) => void;
  onVolumeInsert?: (volume: FluffyVolume) => void;
  onViewDbDetail?: (database: Db, hierarchyData?: any) => void;
  onDbInsert?: (database: Db, hierarchyData?: any) => void;
  onInsertContent?: (content: string) => void;
  getIsEditorFocused?: () => boolean;
}

const DataDirectoryTree: React.FC<DataDirectoryTreeProps> = ({
  onViewDatasetDetail,
  onInsertDataset,
  onViewVolumeDetail,
  onVolumeInsert,
  onViewDbDetail,
  onDbInsert,
  onInsertContent,
  getIsEditorFocused
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState('');

  const hasPermissionDirectory = useHasPermission(
    PYSPARK_PERMISSIONS.CAN_DIRECTORY
  );
  const hasPermissionDataset = useHasPermission(
    PYSPARK_PERMISSIONS.CAN_DATASETS_SEARCH
  );

  // 根据 from 参数动态过滤目录项
  const getFilteredDirectoryItems = () => {
    let filteredItems = directoryItems;
    if (!hasPermissionDirectory) {
      filteredItems = filteredItems.filter(
        (item) => item.id !== 'source' && item.id !== 'target'
      );
    }
    if (!hasPermissionDataset) {
      filteredItems = filteredItems.filter((item) => item.id !== 'dataset');
    }
    return filteredItems;
  };

  // 转换为 Tree 组件需要的数据格式
  const treeData = getFilteredDirectoryItems().map((item) => ({
    key: item.id,
    title: item.label,
    icon: <FileIcon />
  }));

  const handleSelect = (selectedKeys: string[]) => {
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0];
      setSelectedKeys(selectedKeys);
      setCurrentNode(selectedKey);
    }
  };

  // 返回上一级函数
  const handleBack = () => {
    setCurrentNode('');
    setSelectedKeys([]);
  };

  // 处理数据集详情查看
  const handleDatasetDetail = (dataset: DatasetListItem) => {
    onViewDatasetDetail?.(dataset);
  };

  // 处理数据集插入
  const handleDatasetInsert = (dataset: DatasetListItem) => {
    onInsertDataset?.(dataset);
  };

  // 处理数据卷插入
  const handleVolumeInsert = (volume: FluffyVolume) => {
    onVolumeInsert?.(volume);
  };

  // 处理源数据详情查看
  const handleSourceDetail = (volume: FluffyVolume) => {
    onViewVolumeDetail?.('source', volume);
  };

  // 处理目标数据详情查看
  const handleTargetDetail = (volume: FluffyVolume) => {
    console.log('目标数据详情:', volume);
    onViewVolumeDetail?.('target', volume);
  };

  // 根据当前选中的节点渲染对应的组件
  const renderContent = () => {
    switch (currentNode) {
      case 'dataset':
        return (
          <DataCollection
            onBack={handleBack}
            onViewDatasetDetail={handleDatasetDetail}
            onInsertDataset={handleDatasetInsert}
            onInsertContent={handleDatasetInsert}
            isEditorFocused={getIsEditorFocused?.() ?? false}
          />
        );
      case 'source':
        return (
          <SourceTree
            onBack={handleBack}
            onViewSourceDetail={handleSourceDetail}
            onInsert={handleVolumeInsert}
            isEditorFocused={getIsEditorFocused?.() ?? false}
          />
        );
      case 'target':
        return (
          <TargetTree
            onBack={handleBack}
            onViewTargetDetail={handleTargetDetail}
            onInsert={handleVolumeInsert}
            isEditorFocused={getIsEditorFocused?.() ?? false}
          />
        );
      default:
        return (
          <Tree
            className="tree-content"
            treeData={treeData}
            selectedKeys={selectedKeys}
            onSelect={handleSelect}
            showLine={false}
            blockNode
            selectable
          />
        );
    }
  };

  return <div className="pyspark-data-directory-tree">{renderContent()}</div>;
};

export default DataDirectoryTree;
