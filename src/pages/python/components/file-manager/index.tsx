import React, { useCallback, useEffect, useState } from 'react';
import { Typography } from '@arco-design/web-react';
import {
  getPythonList,
  createPythonItem,
  renamePythonItem,
  deletePythonItem,
  copyPythonItem
} from '@/api/python';
import { PythonListItem } from '@/types/pythonApi';
import './index.scss';
import DirectoryTree, {
  type TreeNodeItem
} from '@/components/directory-tree/DirectoryTree';
import { useUrlState } from '../../hooks/useUrlState';
import { PythonItemType } from '@/types/pythonApi';

const { Title } = Typography;

interface NotebookTabContentProps {
  type: 'files' | 'tools' | 'data';
  onFileOpen?: (fileId: string) => void;
}

const usePythonList = () => {
  const [pythonList, setPythonList] = useState<PythonListItem[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const handleSearch = async (path_id: string, searchValue: string) => {
    // 全局搜索功能
    const res = await getPythonList(path_id, {
      name: searchValue,
      mode: 0,
      page: 1,
      page_size: 100
    });

    if (res.status === 200) {
      return res.data?.items ?? [];
    }

    return [];
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

  const handleCreate = async (finalName: string, node) => {
    const createRes = await createPythonItem({
      path_id: node?.dataRef?.path_id,
      type: node?.dataRef?.type,
      name: finalName
    });

    if (createRes.status === 200) {
      return createRes.data;
    }

    return null;
  };

  const handleRename = async (finalName: string, node) => {
    const renameRes = await renamePythonItem(node?.dataRef?.id, {
      id: node?.dataRef?.id,
      name: finalName,
      path: node?.dataRef?.path,
      type: node?.dataRef?.type
    });

    if (renameRes.status === 200) {
      return renameRes.data;
    }

    return null;
  };

  const handleCopy = async (newName: string, node) => {
    const copyRes = await copyPythonItem(node?.dataRef?.id, {
      id: node?.dataRef?.id,
      name: newName
    });

    if (copyRes.status === 200) {
      return copyRes.data;
    }

    return null;
  };

  const handleDelete = async (node) => {
    const deleteRes = await deletePythonItem(node?.dataRef?.id);

    if (deleteRes.status === 200) {
      return true;
    }

    return false;
  };

  const getRawPythonList = useCallback(async () => {
    const rawPythonList = await getPythonList('', {});

    if (rawPythonList.status === 200) {
      setPythonList(rawPythonList.data.items);
    }
  }, []);

  // 数据格式化函数
  const formatData = useCallback((data: unknown[]) => {
    return (
      data?.map((item: any) => {
        return {
          ...item,
          key: String(item.id)
        };
      }) ?? []
    );
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
    handleCreate,
    handleRename,
    handleCopy,
    handleDelete,
    formatData
  };
};

const PythonTabContent: React.FC<NotebookTabContentProps> = ({
  onFileOpen
}) => {
  const {
    searchValue,
    handleSearch,
    handleNew,
    pythonList,
    expandedKeys,
    handleTreeSelect,
    handleTreeExpand,
    handleCreate,
    handleRename,
    handleCopy,
    handleDelete,
    formatData,
    getRawPythonList
  } = usePythonList();

  // 使用URL状态hook
  const { urlState, updateUrlState } = useUrlState();

  const handleFileSelect = (
    selectedKeys: string[],
    extra: {
      selected: boolean;
      selectedNodes: any[];
      node: any;
      e: Event;
    }
  ) => {
    console.log('选中的节点:', selectedKeys, onFileOpen);

    // 如果选中了文件，调用onFileOpen回调
    if (selectedKeys.length > 0 && onFileOpen) {
      const selectedKey = selectedKeys[0];
      // 检查选中的是否是文件（不是文件夹）
      const selectedItem = pythonList.find(
        (item) => String(item.id) === selectedKey
      );
      console.log('selectedItem', pythonList, selectedItem);
      if (selectedItem && selectedItem.type === PythonItemType.Notebook) {
        console.log('透传文件id:', selectedKey);
        onFileOpen(selectedKey);
      }
    }
  };

  return (
    <div className="python-tab-content">
      <div className="tab-header">
        <Title className="tab-title">PySpark文件</Title>
      </div>

      <div className="tab-tree">
        <DirectoryTree
          data={pythonList as TreeNodeItem[]}
          onSelect={handleFileSelect}
          onCreate={handleCreate}
          onRename={handleRename}
          onCopy={handleCopy}
          onDelete={handleDelete}
          onFolderClick={async (folderId) => {
            const res = await getPythonList(String(folderId), {
              name: searchValue,
              mode: 0,
              page: 1,
              page_size: 20
            });
            return res?.data?.items ?? [];
          }}
          onBackToParent={async (parentId) => {
            const res = await getPythonList(String(parentId || ''), {} as any);
            return res?.data?.items || [];
          }}
          onSearch={handleSearch}
          formatData={formatData}
          placeholder="搜索当前文件夹"
          newButtonText="新建"
          onUrlStateChange={updateUrlState}
          initialUrlState={urlState}
          autoSelectOrCreate={true}
          onAutoFileOpen={onFileOpen}
        />
      </div>
    </div>
  );
};

export default PythonTabContent;
