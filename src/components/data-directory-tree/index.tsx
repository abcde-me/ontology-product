import React, { useState } from 'react';
import { Tree } from '@arco-design/web-react';
import DataCollection from './components/daset-tree';
import SourceTargetTree from './components/source-taget-tree';
import FileIcon from './assets/file-icon.svg';
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

const DataDirectoryTree: React.FC<{}> = () => {
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

  // 根据当前选中的节点渲染对应的组件
  const renderContent = () => {
    switch (currentNode) {
      case 'dataset':
        return <DataCollection onBack={handleBack} />;
      case 'source':
        return <SourceTargetTree type="source" onBack={handleBack} />;
      case 'target':
        return <SourceTargetTree type="target" onBack={handleBack} />;
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
