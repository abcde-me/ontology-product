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

  // 处理文件详情事件
  const handleFileDetail = (file: any) => {
    console.log('文件详情:', file);
    // 这里可以添加显示文件详情的逻辑
    // 比如打开一个模态框显示文件信息
  };

  // 处理文件插入事件
  const handleFileInsert = (file: any) => {
    console.log('文件插入:', file);
    // 这里可以添加插入文件的逻辑
    // 比如将文件添加到某个工作区或执行插入操作
  };

  // 根据当前选中的节点渲染对应的组件
  const renderContent = () => {
    switch (currentNode) {
      case 'dataset':
        return <DataCollection type="python" onBack={handleBack} />;
      case 'source':
        return (
          <SourceTargetTree
            dataType="source"
            type="python"
            onBack={handleBack}
            onFileDetail={handleFileDetail}
            onFileInsert={handleFileInsert}
          />
        );
      case 'target':
        return (
          <SourceTargetTree
            dataType="target"
            type="python"
            onBack={handleBack}
            onFileDetail={handleFileDetail}
            onFileInsert={handleFileInsert}
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
