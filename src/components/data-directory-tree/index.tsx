import React, { useState } from 'react';
import { Tree } from '@arco-design/web-react';
import DataCollection from './components/daset-tree';
import SourceTargetTree from './components/source-taget-tree';
import FileIcon from './assets/file-icon.svg';
import { DatasetListItem } from '@/types/datasetManagement';
import './index.scss';
import { Db, FluffyVolume } from '@/api/dataCatalog';
import { DataDirectoryTreeFrom } from './types';

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

// 转换为 Tree 组件需要的数据格式
const treeData = directoryItems.map((item) => ({
  key: item.id,
  title: item.label,
  icon: <FileIcon />
}));

interface DataDirectoryTreeProps {
  from?: DataDirectoryTreeFrom;
  onViewDatasetDetail?: (dataset: DatasetListItem) => void;
  onInsertDataset?: (dataset: DatasetListItem) => void;
  onViewVolumeDetail?: (
    dataType: 'source' | 'target',
    volume: FluffyVolume
  ) => void;
  onVolumeInsert?: (volume: FluffyVolume) => void;
  onViewDbDetail?: (database: Db) => void;
  onDbInsert?: (database: Db) => void;
  onInsertContent?: (content: string) => void;
  isEditorFocused?: boolean;
}

const DataDirectoryTree: React.FC<DataDirectoryTreeProps> = ({
  from = DataDirectoryTreeFrom.PYTHON,
  onViewDatasetDetail,
  onInsertDataset,
  onViewVolumeDetail,
  onVolumeInsert,
  onViewDbDetail,
  onDbInsert,
  onInsertContent,
  isEditorFocused = false
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState('');

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

  // 处理数据卷详情查看
  const handleVolumeDetail = (
    dataType: 'source' | 'target',
    volume: FluffyVolume
  ) => {
    onViewVolumeDetail?.(dataType, volume);
  };

  // 处理数据卷插入
  const handleVolumeInsert = (volume: FluffyVolume) => {
    onVolumeInsert?.(volume);
  };

  // 处理数据库详情查看
  const handleDbDetail = (database: Db) => {
    onViewDbDetail?.(database);
  };

  // 处理数据库插入
  const handleDbInsert = (database: Db) => {
    onDbInsert?.(database);
  };

  // 根据当前选中的节点渲染对应的组件
  const renderContent = () => {
    switch (currentNode) {
      case 'dataset':
        return (
          <DataCollection
            type={from}
            onBack={handleBack}
            // 数据集详情
            onViewDatasetDetail={handleDatasetDetail}
            // 数据集插入
            onInsertDataset={handleDatasetInsert}
            // 插入内容
            onInsertContent={onInsertContent}
            // 编辑器聚焦状态
            isEditorFocused={isEditorFocused}
          />
        );
      case 'source':
        return (
          <SourceTargetTree
            dataType="source"
            type={from}
            onBack={handleBack}
            // 数据卷详情
            onVolumeDetail={(v) => handleVolumeDetail('source', v)}
            // 数据卷插入
            onVolumeInsert={handleVolumeInsert}
            // 数据库详情
            onDbDetail={handleDbDetail}
            // 数据库插入
            onDbInsert={handleDbInsert}
            // 编辑器聚焦状态
            isEditorFocused={isEditorFocused}
          />
        );
      case 'target':
        return (
          <SourceTargetTree
            dataType="target"
            type={from}
            onBack={handleBack}
            // 数据卷详情
            onVolumeDetail={(v) => handleVolumeDetail('target', v)}
            // 数据卷插入
            onVolumeInsert={handleVolumeInsert}
            // 数据库详情
            onDbDetail={handleDbDetail}
            // 数据库插入
            onDbInsert={handleDbInsert}
            // 编辑器聚焦状态
            isEditorFocused={isEditorFocused}
          />
        );
      default:
        return (
          <Tree
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

  return <div className="data-directory-tree">{renderContent()}</div>;
};

export default DataDirectoryTree;
