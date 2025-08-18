import React, { useCallback, useState } from 'react';
import { Input, Button, Tree, Typography } from '@arco-design/web-react';
import {
  IconSearch,
  IconPlus,
  IconFolder,
  IconFile
} from '@arco-design/web-react/icon';
import './NotebookTabContent.scss';
import { getPythonList } from '@/api/python';
import { PythonListItem } from '@/types/pythonApi';

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

const usePythonList = () => {
  const pythonList = useState<PythonListItem[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  console.log('pythonListpythonList', pythonList);

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

  const formatPythonList = (rawData) => {
    return rawData.map((item) => item);
  };

  const getRawPythonList = useCallback(async () => {
    const rawPythonList = await getPythonList('', {});

    if (rawPythonList.status === 200) {
      pythonList.values = formatPythonList(rawPythonList.data.items);
    }
  }, []);

  return {
    searchValue,
    handleSearch,
    handleNew,
    pythonList,
    getRawPythonList,
    expandedKeys,
    handleTreeSelect,
    handleTreeExpand
  };
};

const PythonTabContent: React.FC<NotebookTabContentProps> = () => {
  const {
    searchValue,
    handleSearch,
    handleNew,
    pythonList,
    expandedKeys,
    handleTreeSelect,
    handleTreeExpand
  } = usePythonList();

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
          treeData={pythonList}
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
