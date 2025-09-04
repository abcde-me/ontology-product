import { useState, useCallback, useEffect } from 'react';
import { Message } from '@arco-design/web-react';
import {
  getPythonList,
  createPythonItem,
  renamePythonItem,
  deletePythonItem,
  copyPythonItem
} from '@/api/pyspark';
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
  selectedKeys: string[];
  currentFolderId: string;

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
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]); // 添加选中状态
  const [currentFolderId, setCurrentFolderId] = useState<string>('0'); // 当前文件夹ID，默认为根目录

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

  // 树选择处理 - 处理文件点击，自动打开文件
  const handleTreeSelect = useCallback(
    (selectedKeys: string[], extra?: any) => {
      console.log('选中的节点:', selectedKeys);

      // 更新选中状态
      setSelectedKeys(selectedKeys);

      // 如果有选中节点且有额外信息，处理文件点击
      if (selectedKeys.length > 0 && extra && onFileOpen) {
        const dataRef = extra?.node?.props?.dataRef;

        // 检查是否正在新建文件（showInput 或 isAdd 为 true）
        const isCreating = dataRef?.showInput || dataRef?.isAdd;

        // 如果正在新建文件，不自动打开
        if (isCreating) {
          console.log('🔄 正在新建文件，跳过自动打开');
          return;
        }

        // 如果点击的是文件（不是文件夹），自动打开
        if (dataRef && dataRef.type !== PythonItemType.Directory) {
          console.log(
            '📁 点击文件，自动打开:',
            dataRef.name,
            'ID:',
            dataRef.id
          );
          onFileOpen(String(dataRef.id), dataRef.name);
        }
      }
    },
    [onFileOpen]
  );

  // 树展开处理
  const handleTreeExpand = useCallback((keys: string[]) => {
    setExpandedKeys(keys);
  }, []);

  // 获取原始Python列表
  const getRawPythonList = useCallback(
    async (folderId?: string) => {
      if (isLoading) return; // 防止重复请求

      const targetFolderId = folderId || currentFolderId;
      setIsLoading(true);
      try {
        const rawPythonList = await getPythonList(targetFolderId, {});

        if (rawPythonList.status === 200) {
          setPythonList(rawPythonList.data.items);

          // 只有在根目录且列表加载完成后，才自动打开第一个文件（如果存在且编辑器中无文件打开）
          if (
            targetFolderId === '0' &&
            rawPythonList.data.items.length > 0 &&
            onFileOpen
          ) {
            const firstFile = rawPythonList.data.items.find(
              (item) => item.type !== PythonItemType.Directory
            );
            if (firstFile) {
              console.log(
                '🚀 初始化时自动打开第一个文件:',
                firstFile.name,
                'ID:',
                firstFile.id
              );
              // 设置选中状态
              setSelectedKeys([String(firstFile.id)]);
              onFileOpen(String(firstFile.id), firstFile.name);
            }
          }
        }
      } catch (error) {
        console.error('获取Python列表失败:', error);
        Message.error('获取文件列表失败');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, onFileOpen, currentFolderId]
  );

  // 创建文件/文件夹
  const handleCreate = useCallback(
    async (finalName: string, node: any) => {
      try {
        const createRes = await createPythonItem({
          path_id: node?.dataRef?.path_id,
          type: node?.dataRef?.type,
          name: finalName
        });

        if (createRes.status !== 200) {
          Message.error(createRes?.message ?? '创建失败');
          return null;
        }

        Message.success('创建成功');
        // 刷新当前文件夹列表
        await getRawPythonList(currentFolderId);

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
          // 设置选中状态
          setSelectedKeys([String(createRes.data.id)]);
          // 延迟一下打开文件，确保列表刷新完成
          onFileOpen(String(createRes.data.id), createRes.data.name);
        } else if (
          createRes.data &&
          createRes.data.type === PythonItemType.Directory
        ) {
          console.log('✅ 新建文件夹成功:', createRes.data.name);
        }

        return createRes.data;
      } catch (error) {
        console.error('创建失败:', error);
        Message.error('创建失败');
        return null;
      }
    },
    [getRawPythonList, onFileOpen, currentFolderId]
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

        if (renameRes.status !== 200) {
          Message.error(renameRes?.message ?? '重命名失败');
          return null;
        }

        Message.success('重命名成功');
        // 刷新当前文件夹列表
        await getRawPythonList(currentFolderId);
        return renameRes.data;
      } catch (error) {
        console.error('重命名失败:', error);
        Message.error('重命名失败');
        return null;
      }
    },
    [getRawPythonList, currentFolderId]
  );

  // 复制
  const handleCopy = useCallback(
    async (newName: string, node: any) => {
      try {
        const copyRes = await copyPythonItem(node?.dataRef?.id, {
          id: node?.dataRef?.id,
          name: newName
        });

        if (copyRes.status !== 200) {
          Message.error(copyRes?.message ?? '复制失败');
          return null;
        }

        Message.success('复制成功');
        // 刷新当前文件夹列表
        await getRawPythonList(currentFolderId);
        return copyRes.data;
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

        if (deleteRes.status !== 200) {
          Message.error(deleteRes?.message ?? '删除失败');
          return false;
        }

        Message.success('删除成功');
        // 刷新当前文件夹列表
        await getRawPythonList(currentFolderId);
        return true;
      } catch (error) {
        console.error('删除失败:', error);
        Message.error('删除失败');
        return false;
      }
    },
    [getRawPythonList, currentFolderId]
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

  // 文件夹点击处理
  const handleFolderClick = useCallback(
    async (folderId: string) => {
      try {
        // 更新当前文件夹ID
        setCurrentFolderId(folderId);

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
      // 更新当前文件夹ID
      setCurrentFolderId(parentId || '0');

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
    selectedKeys,
    currentFolderId,

    // 操作函数
    handleSearch,
    handleNew,
    handleTreeSelect,
    handleTreeExpand,
    handleCreate,
    handleRename,
    handleCopy,
    handleDelete,
    handleFolderClick,
    handleBackToParent,

    // 工具函数
    getRawPythonList,
    formatData
  };
};
