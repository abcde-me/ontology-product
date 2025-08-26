import { useState, useCallback, useEffect } from 'react';
import { Message } from '@arco-design/web-react';
import {
  getPythonList,
  createPythonItem,
  renamePythonItem,
  deletePythonItem,
  copyPythonItem
} from '@/api/python';
import { PythonListItem, PythonItemType } from '@/types/pythonApi';

interface UseFileManagerOptions {
  onFileOpen?: (fileId: string, fileName?: string) => void;
}

interface UseFileManagerReturn {
  // 状态
  pythonList: PythonListItem[];
  searchValue: string;
  expandedKeys: string[];
  isLoading: boolean;

  // 操作函数
  handleSearch: (
    path_id: string,
    searchValue: string
  ) => Promise<PythonListItem[]>;
  handleNew: () => void;
  handleTreeSelect: (selectedKeys: string[]) => void;
  handleTreeExpand: (keys: string[]) => void;
  handleCreate: (finalName: string, node: any) => Promise<any>;
  handleRename: (finalName: string, node: any) => Promise<any>;
  handleCopy: (newName: string, node: any) => Promise<any>;
  handleDelete: (node: any) => Promise<boolean>;
  handleFileSelect: (
    selectedKeys: string[],
    extra: {
      selected: boolean;
      selectedNodes: any[];
      node: any;
      e: Event;
    }
  ) => void;
  handleFolderClick: (folderId: string) => Promise<PythonListItem[]>;
  handleBackToParent: (parentId: string) => Promise<PythonListItem[]>;

  // 工具函数
  getRawPythonList: () => Promise<void>;
  formatData: (data: unknown[]) => any[];
}

export const useFileManager = (
  options: UseFileManagerOptions = {}
): UseFileManagerReturn => {
  const { onFileOpen } = options;

  // 状态管理
  const [pythonList, setPythonList] = useState<PythonListItem[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 搜索功能
  const handleSearch = useCallback(
    async (path_id: string, searchValue: string) => {
      try {
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
      } catch (error) {
        console.error('搜索失败:', error);
        Message.error('搜索失败');
        return [];
      }
    },
    []
  );

  // 新建功能
  const handleNew = useCallback(() => {
    console.log('新建');
    // 这里可以添加新建逻辑
  }, []);

  // 树选择处理
  const handleTreeSelect = useCallback((selectedKeys: string[]) => {
    console.log('选中的节点:', selectedKeys);
  }, []);

  // 树展开处理
  const handleTreeExpand = useCallback((keys: string[]) => {
    setExpandedKeys(keys);
  }, []);

  // 获取原始Python列表
  const getRawPythonList = useCallback(async () => {
    if (isLoading) return; // 防止重复请求

    setIsLoading(true);
    try {
      const rawPythonList = await getPythonList('', {});

      if (rawPythonList.status === 200) {
        setPythonList(rawPythonList.data.items);
      }
    } catch (error) {
      console.error('获取Python列表失败:', error);
      Message.error('获取文件列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // 创建文件/文件夹
  const handleCreate = useCallback(
    async (finalName: string, node: any) => {
      try {
        const createRes = await createPythonItem({
          path_id: node?.dataRef?.path_id,
          type: node?.dataRef?.type,
          name: finalName
        });

        if (createRes.status === 200) {
          Message.success('创建成功');
          // 刷新列表
          await getRawPythonList();

          // 如果是创建的文件（不是文件夹），自动在编辑器中打开
          if (
            createRes.data &&
            createRes.data.type !== PythonItemType.Directory &&
            onFileOpen
          ) {
            console.log(
              '✅ 新建文件成功，自动打开文件:',
              createRes.data.name,
              'ID:',
              createRes.data.id
            );
            // 延迟一下打开文件，确保列表刷新完成
            setTimeout(() => {
              onFileOpen(String(createRes.data.id), createRes.data.name);
            }, 100);
          }

          return createRes.data;
        }
        return null;
      } catch (error) {
        console.error('创建失败:', error);
        Message.error('创建失败');
        return null;
      }
    },
    [getRawPythonList, onFileOpen]
  );

  // 重命名
  const handleRename = useCallback(
    async (finalName: string, node: any) => {
      try {
        const renameRes = await renamePythonItem(node?.dataRef?.id, {
          id: node?.dataRef?.id,
          name: finalName,
          path: node?.dataRef?.path,
          type: node?.dataRef?.type
        });

        if (renameRes.status === 200) {
          Message.success('重命名成功');
          // 刷新列表
          await getRawPythonList();
          return renameRes.data;
        }
        return null;
      } catch (error) {
        console.error('重命名失败:', error);
        Message.error('重命名失败');
        return null;
      }
    },
    [getRawPythonList]
  );

  // 复制
  const handleCopy = useCallback(
    async (newName: string, node: any) => {
      try {
        const copyRes = await copyPythonItem(node?.dataRef?.id, {
          id: node?.dataRef?.id,
          name: newName
        });

        if (copyRes.status === 200) {
          Message.success('复制成功');
          // 刷新列表
          await getRawPythonList();
          return copyRes.data;
        }
        return null;
      } catch (error) {
        console.error('复制失败:', error);
        Message.error('复制失败');
        return null;
      }
    },
    [getRawPythonList]
  );

  // 删除
  const handleDelete = useCallback(
    async (node: any) => {
      try {
        const deleteRes = await deletePythonItem(node?.dataRef?.id);

        if (deleteRes.status === 200) {
          Message.success('删除成功');
          // 刷新列表
          await getRawPythonList();
          return true;
        }
        return false;
      } catch (error) {
        console.error('删除失败:', error);
        Message.error('删除失败');
        return false;
      }
    },
    [getRawPythonList]
  );

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

  // 文件选择处理
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
          onFileOpen(selectedKey, selectedItem.name); // 修复：传递 fileName 参数
        } else {
          console.log('❌ 文件类型不匹配或未找到文件项');
        }
      } else {
        console.log('❌ 缺少选中键或onFileOpen回调');
      }
    },
    [onFileOpen]
  );

  // 文件夹点击处理
  const handleFolderClick = useCallback(
    async (folderId: string) => {
      try {
        const res = await getPythonList(String(folderId), {
          name: searchValue,
          mode: 0,
          page: 1,
          page_size: 20
        });
        return res?.data?.items ?? [];
      } catch (error) {
        console.error('获取文件夹内容失败:', error);
        Message.error('获取文件夹内容失败');
        return [];
      }
    },
    [searchValue]
  );

  // 返回父级处理
  const handleBackToParent = useCallback(async (parentId: string) => {
    try {
      const res = await getPythonList(String(parentId || ''), {} as any);
      return res?.data?.items || [];
    } catch (error) {
      console.error('返回父级失败:', error);
      Message.error('返回父级失败');
      return [];
    }
  }, []);

  // 组件挂载时获取数据
  useEffect(() => {
    getRawPythonList();
  }, []); // 只在组件挂载时执行一次

  return {
    // 状态
    pythonList,
    searchValue,
    expandedKeys,
    isLoading,

    // 操作函数
    handleSearch,
    handleNew,
    handleTreeSelect,
    handleTreeExpand,
    handleCreate,
    handleRename,
    handleCopy,
    handleDelete,
    handleFileSelect,
    handleFolderClick,
    handleBackToParent,

    // 工具函数
    getRawPythonList,
    formatData
  };
};
