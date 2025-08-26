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
  hasOpenFiles?: boolean; // 新增：通过props传递是否有打开的文件
}

const usePythonList = () => {
  const [pythonList, setPythonList] = useState<PythonListItem[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // 修复：移除 useCallback，直接定义函数
  const getRawPythonList = async () => {
    if (isLoading) return; // 防止重复请求

    setIsLoading(true);
    try {
      const rawPythonList = await getPythonList('', {});

      if (rawPythonList.status === 200) {
        setPythonList(rawPythonList.data.items);
      }
    } catch (error) {
      console.error('获取Python列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 数据格式化函数
  const formatData = useCallback((data: unknown[]) => {
    return (
      data?.map((item: any) => {
        return {
          ...item,
          key: String(item.id),
          // 确保每个节点都有 dataRef 属性，这样 Tree 组件就能正确传递文件信息
          dataRef: item
        };
      }) ?? []
    );
  }, []);

  // 修复：只在组件挂载时执行一次
  useEffect(() => {
    getRawPythonList();
  }, []); // 移除 getRawPythonList 依赖

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
    formatData,
    isLoading
  };
};

const PythonTabContent: React.FC<NotebookTabContentProps> = ({
  onFileOpen,
  hasOpenFiles = false // 设置默认值
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
    getRawPythonList,
    isLoading
  } = usePythonList();

  // 使用URL状态hook
  const { urlState, updateUrlState } = useUrlState();

  const handleFileSelect = useCallback(
    (
      selectedKeys: string[],
      extra: {
        selected: boolean;
        selectedNodes: any[];
        node: any;
        e: Event;
      }
    ) => {
      console.log('=== 文件选择调试信息 ===');
      console.log('选中的节点:', selectedKeys);
      console.log('onFileOpen 回调:', onFileOpen);
      console.log('extra 对象:', extra);

      // 如果选中了文件，调用onFileOpen回调
      if (selectedKeys.length > 0 && onFileOpen) {
        const selectedKey = selectedKeys[0];

        // 从选中的节点中获取文件信息，而不是从pythonList中查找
        const selectedNode = extra.selectedNodes[0];
        const selectedItem = selectedNode?.props?.dataRef;

        console.log('选中的文件项:', selectedItem);
        console.log('文件类型:', selectedItem?.type);

        // 修复：只要不是目录类型，就认为是文件，都应该能打开
        if (selectedItem && selectedItem.type !== PythonItemType.Directory) {
          console.log('✅ 准备打开文件，ID:', selectedKey);
          onFileOpen(selectedKey);
        } else {
          console.log('❌ 文件类型不匹配或未找到文件项');
        }
      } else {
        console.log('❌ 缺少选中键或onFileOpen回调');
      }
    },
    [onFileOpen]
  );

  // 修复：使用 useCallback 包装 onFolderClick 和 onBackToParent
  const handleFolderClick = useCallback(
    async (folderId: string) => {
      const res = await getPythonList(String(folderId), {
        name: searchValue,
        mode: 0,
        page: 1,
        page_size: 20
      });
      return res?.data?.items ?? [];
    },
    [searchValue]
  );

  const handleBackToParent = useCallback(async (parentId: string) => {
    const res = await getPythonList(String(parentId || ''), {} as any);
    return res?.data?.items || [];
  }, []);

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
          onFolderClick={(parentId?: string) =>
            handleFolderClick(parentId ?? '')
          }
          onBackToParent={(parentId?: string) =>
            handleBackToParent(parentId ?? '')
          }
          onSearch={handleSearch}
          formatData={formatData}
          placeholder="搜索当前文件夹"
          newButtonText="新建"
          onUrlStateChange={updateUrlState}
          initialUrlState={urlState}
          autoSelectOrCreate={!hasOpenFiles} // 只在没有文件打开时自动选择
          onAutoFileOpen={onFileOpen}
        />
      </div>
    </div>
  );
};

export default PythonTabContent;
