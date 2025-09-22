import { DatasetListItem } from '@/types/datasetManagement';
import { Tree } from '@arco-design/web-react';
import React, { useState } from 'react';
import FileIcon from './assets/file-icon.svg';
import DataCollection from './components/daset-tree';
import SourceTree from './components/source-tree';
import './index.scss';

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
  }
];

interface DataDirectoryTreeProps {
  onViewDatasetDetail?: (dataset: DatasetListItem) => void;
  onInsertDataset?: (dataset: DatasetListItem) => void;
  onViewDbDetail?: (nodeData: any) => void;
  onDbInsert?: (data: any) => void;
  onInsertContent?: (content: string) => void;
  getIsEditorFocused?: () => boolean;
}

const DataDirectoryTree: React.FC<DataDirectoryTreeProps> = ({
  onViewDatasetDetail,
  onInsertDataset,
  onViewDbDetail,
  onDbInsert,
  getIsEditorFocused
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState('');

  // 转换为 Tree 组件需要的数据格式
  const treeData = directoryItems.map((item) => ({
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

  // 处理数据库详情查看
  const handleDbDetail = (nodeData: any) => {
    onViewDbDetail?.(nodeData);
  };

  // 处理数据库插入
  const handleDbInsert = (data: any) => {
    onDbInsert?.(data);
  };

  // 根据当前选中的节点渲染对应的组件
  const renderContent = () => {
    switch (currentNode) {
      case 'dataset':
        return (
          <DataCollection
            onBack={handleBack}
            // 数据集详情
            onViewDatasetDetail={handleDatasetDetail}
            // 数据集插入
            onInsertDataset={handleDatasetInsert}
            // 插入内容
            // onInsertContent={handleDatasetInsert}
            // 编辑器聚焦状态
            isEditorFocused={getIsEditorFocused?.() ?? false}
          />
        );
      case 'source':
        return (
          <SourceTree
            onBack={handleBack}
            // 数据库详情
            onViewDbDetail={handleDbDetail}
            // 数据库插入
            onDbInsert={handleDbInsert}
            // // 编辑器聚焦状态
            isEditorFocused={getIsEditorFocused?.() ?? false}
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

  return <div className="sql-data-directory-tree">{renderContent()}</div>;
};

export default DataDirectoryTree;
