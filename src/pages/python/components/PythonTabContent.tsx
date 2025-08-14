import React, { useState } from 'react';
import { Input, Button, Tree, Typography } from '@arco-design/web-react';
import {
  IconSearch,
  IconPlus,
  IconFolder,
  IconFile
} from '@arco-design/web-react/icon';
import './NotebookTabContent.scss';

const { Title } = Typography;

interface NotebookTabContentProps {
  type: 'files' | 'tools' | 'data';
}

interface TreeNode {
  key: string;
  title: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
}

const PythonTabContent: React.FC<NotebookTabContentProps> = () => {
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // 这里可以添加搜索逻辑
  };

  const handleNew = () => {
    // 这里可以添加新建逻辑
    console.log(`新建`);
  };

  const handleTreeSelect = (selectedKeys: string[]) => {
    console.log('选中的节点:', selectedKeys);
  };

  const handleTreeExpand = (keys: string[]) => {
    setExpandedKeys(keys);
  };

  return (
    <div className="notebook-tab-content">
      <div className="tab-header">
        <Title className="tab-title">Python文件</Title>
      </div>

      <div className="tab-search">
        <div className="search-container">
          <Input
            placeholder="搜索当前文件夹"
            value={searchValue}
            onChange={handleSearch}
            prefix={<IconSearch />}
            style={{ flex: 1 }}
          />
          <Button
            type="text"
            icon={<IconPlus />}
            onClick={handleNew}
            size="small"
          >
            新建
          </Button>
        </div>
      </div>

      <div className="tab-tree">
        <Tree
          treeData={[]}
          selectedKeys={[]}
          expandedKeys={expandedKeys}
          onSelect={handleTreeSelect}
          onExpand={handleTreeExpand}
          showLine
        />
      </div>
    </div>
  );
};

export default PythonTabContent;
