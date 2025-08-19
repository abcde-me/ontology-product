import React, { useCallback, useEffect, useState } from 'react';
import { Input, Button, Tree, Typography } from '@arco-design/web-react';
import {
  IconSearch,
  IconPlus,
  IconFolder,
  IconFile
} from '@arco-design/web-react/icon';
import {
  getPythonList,
  createPythonItem,
  renamePythonItem,
  deletePythonItem,
  copyPythonItem
} from '@/api/python';
import { PythonItemType, PythonListItem } from '@/types/pythonApi';
import './PythonTabContent.scss';
import DirectoryTree, {
  type TreeNodeItem
} from '@/components/directory-tree/DirectoryTree';

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
  const [pythonList, setPythonList] = useState<PythonListItem[]>([]);
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

  const handleCreate = async (finalName: string, path_id: number, node) => {
    const createRes = await createPythonItem({
      path_id,
      type: node?.dataRef?.type,
      name: finalName
    });

    if (createRes.status === 200) {
      return createRes.data;
    }

    return null;
  };

  const getRawPythonList = useCallback(async () => {
    const rawPythonList = await getPythonList('', {});

    if (rawPythonList.status === 200) {
      setPythonList(rawPythonList.data.items);
    }
  }, []);

  useEffect(() => {
    getRawPythonList();
  }, [getRawPythonList]);

  return {
    searchValue,
    handleSearch,
    handleNew,
    pythonList,
    getRawPythonList,
    expandedKeys,
    handleTreeSelect,
    handleTreeExpand,
    handleCreate
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
    handleTreeExpand,
    handleCreate
  } = usePythonList();

  return (
    <div className="notebook-tab-content">
      <div className="tab-header">
        <Title className="tab-title">PySpark文件</Title>
      </div>

      <div className="tab-tree">
        <DirectoryTree
          data={pythonList as TreeNodeItem[]}
          onSelect={(keys) => handleTreeSelect(keys as unknown as string[])}
          onCreate={handleCreate}
          onRename={async () => {}}
          onCopy={async () => {}}
          onDelete={async () => {}}
          onFolderClick={async (folderId) => {
            // 这里调用API获取文件夹内容
            console.log('进入文件夹:', folderId);
            const res = await getPythonList(String(folderId), {
              name: searchValue,
              mode: 0,
              page: 1,
              page_size: 20
            });
            return res?.data?.items || [];
          }}
          onBackToParent={async (parentId) => {
            // 这里调用API获取上级目录内容
            console.log('返回上级目录:', parentId);
            const res = await getPythonList(String(parentId || ''), {} as any);
            return res?.data?.items || [];
          }}
          placeholder="搜索当前文件夹"
          newButtonText="新建"
        />
      </div>
    </div>
  );
};

export default PythonTabContent;
