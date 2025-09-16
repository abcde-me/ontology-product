import { useState, useCallback, useEffect } from 'react';
import { Message } from '@arco-design/web-react';
import { now } from 'lodash-es';
import {
  getSqlScriptList,
  createSqlScript,
  renameSqlScript,
  deleteSqlScript,
  copySqlScript
} from '@/api/sql';
import { PythonItemType } from '@/types/pythonApi';
import timeFormattig from '@/utils/timeFormatting';
import { SqlScriptItem } from '@/types/sqlApi';
import { generateSqlDefaultName } from '../utils';
import { useUserInfo } from '@/store/userInfoStore';
import { validateName } from '@/utils/valiate';

interface UseFileManagerOptions {
  onFileOpen?: (
    fileId: string,
    scriptId: string,
    fileName?: string,
    perms?: Array<string>
  ) => void;
  onFileDelete?: (fileId: string) => void; // 删除文件时关闭标签页的回调
  onFileRename?: (fileId: string, newName: string) => void; // 重命名文件时更新标签页标题的回调
  externalSelectedKeys?: string[]; // 外部传入的选中状态
}

interface UseFileManagerReturn {
  // 状态
  sqlScriptList: SqlScriptItem[];
  searchValue: string;
  expandedKeys: string[];
  isLoading: boolean;
  selectedKeys: string[];

  // 操作函数
  generateDefaultName: (node: any) => string;
  handleSearch: (
    path_id: string,
    searchValue: string
  ) => Promise<SqlScriptItem[]>;
  handleNew: () => void;
  handleTreeSelect: (selectedKeys: string[]) => void;
  handleTreeExpand: (keys: string[]) => void;
  handleCreate: (finalName: string, node: any) => Promise<any>;
  handleRename: (finalName: string, node: any) => Promise<any>;
  handleCopy: (newName: string, node: any) => Promise<any>;
  handleDelete: (node: any) => Promise<boolean>;
  handleFolderClick: (folderId: string) => Promise<SqlScriptItem[]>;
  handleBackToParent: (parentId: string) => Promise<SqlScriptItem[]>;

  // 工具函数
  getRawSqlScriptList: () => Promise<void>;
  formatData: (data: unknown[]) => any[];
  refreshDirectory: () => Promise<void>; // 刷新目录
  selectFile: (fileId: string) => void; // 选中文件
}

export const useFileManager = (
  options: UseFileManagerOptions = {}
): UseFileManagerReturn => {
  const userInfo = useUserInfo();
  const { onFileOpen, onFileDelete, onFileRename, externalSelectedKeys } =
    options;

  // 状态管理
  const [sqlScriptList, setSqlScriptList] = useState<SqlScriptItem[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]); // 添加选中状态

  const generateDefaultName = useCallback((node: any) => {
    // 生成默认文件名：SQL查询 + 时间戳
    return generateSqlDefaultName(new Date());
  }, []);

  // 搜索功能
  const handleSearch = useCallback(
    async (path_id: string, searchValue: string) => {
      try {
        const res = await getSqlScriptList({
          search_content: searchValue,
          page: 1,
          page_size: 1000
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
            dataRef.id,
            dataRef.script_id
          );
          onFileOpen(
            String(dataRef.id),
            String(dataRef.script_id),
            dataRef.name,
            dataRef.perms
          );
        }
      }
    },
    [onFileOpen]
  );

  // 树展开处理
  const handleTreeExpand = useCallback((keys: string[]) => {
    setExpandedKeys(keys);
  }, []);

  // 获取原始SqlScript列表
  const getRawSqlScriptList = useCallback(async () => {
    if (isLoading) return; // 防止重复请求

    setIsLoading(true);
    try {
      const rawSqlScriptListRes = await getSqlScriptList({
        page: 1,
        page_size: 1000
      });

      if (rawSqlScriptListRes.status !== 200) {
        Message.error(rawSqlScriptListRes.message);
        return;
      }

      const rawSqlScriptList = rawSqlScriptListRes.data.items;
      setSqlScriptList(rawSqlScriptList);
    } catch (error) {
      Message.error('获取文件列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onFileOpen]);

  // 创建文件/文件夹
  const handleCreate = useCallback(
    async (finalName: string, node: any) => {
      try {
        if (!validateName(finalName).isValid) {
          Message.error(
            validateName(finalName)?.errorMessage ?? '命名不符合规则'
          );
          return;
        }

        const scriptFileId = String(Date.now());
        const createRes = await createSqlScript({
          uid: userInfo?.id ?? '',
          script_file_id: scriptFileId,
          script_name: finalName
        });

        if (createRes.status !== 200) {
          Message.error(createRes.message);
          return;
        }

        Message.success('创建成功');

        // 刷新列表
        await getRawSqlScriptList();

        // 设置选中状态
        setSelectedKeys([scriptFileId]);

        // 编辑器自动打开当前脚本
        onFileOpen &&
          onFileOpen(
            scriptFileId,
            String(createRes.data.script_id),
            finalName,
            createRes.data.perms
          );

        return createRes.data;
      } catch (error) {
        console.error('创建失败:', error);
        Message.error('创建失败');
        return null;
      }
    },
    [getRawSqlScriptList, onFileOpen]
  );

  // 重命名
  const handleRename = useCallback(
    async (finalName: string, node: any) => {
      try {
        const fileId = node?.dataRef?.id;
        const renameRes = await renameSqlScript(fileId, {
          script_name: finalName
        });

        if (renameRes.status !== 200) {
          Message.error(renameRes.message);
          return null;
        }

        Message.success('重命名成功');

        // 如果重命名的是文件，更新对应的标签页标题
        if (fileId && onFileRename) {
          onFileRename(String(fileId), finalName);
        }

        // 刷新列表
        await getRawSqlScriptList();
        return renameRes.data;
      } catch (error) {
        console.error('重命名失败:', error);
        Message.error('重命名失败');
        return null;
      }
    },
    [getRawSqlScriptList, onFileRename]
  );

  // 复制
  const handleCopy = useCallback(
    async (newName: string, node: any) => {
      try {
        const copyRes = await copySqlScript(node?.dataRef?.id);

        if (copyRes.status !== 200) {
          Message.error(copyRes.message);
          return null;
        }

        Message.success('复制成功');
        // 刷新列表
        await getRawSqlScriptList();
        return copyRes.data;
      } catch (error) {
        console.error('复制失败:', error);
        Message.error('复制失败');
        return null;
      }
    },
    [getRawSqlScriptList]
  );

  // 删除
  const handleDelete = useCallback(
    async (node: any) => {
      try {
        const fileId = node?.dataRef?.id;
        const deleteRes = await deleteSqlScript(fileId);

        if (deleteRes.status !== 200) {
          Message.error(deleteRes.message);
          return false;
        }

        Message.success('删除成功');

        // 如果删除的是文件，关闭对应的标签页
        if (fileId && onFileDelete) {
          onFileDelete(fileId);
        }

        // 刷新列表
        await getRawSqlScriptList();
        return true;
      } catch (error) {
        console.error('删除失败:', error);
        Message.error('删除失败');
        return false;
      }
    },
    [getRawSqlScriptList, onFileDelete]
  );

  // 数据格式化函数
  const formatData = useCallback((data: unknown[]) => {
    return (
      data?.map((item: any) => {
        return {
          id: String(Number(item.script_file_id) || item.script_id),
          script_id: item.script_id,
          name: item.script_name,
          type: PythonItemType.Notebook,
          key: String(Number(item.script_file_id) || item.script_id), // ✅ 添加key属性，Tree组件需要这个来管理选中状态
          // 确保每个节点都有 dataRef 属性，这样 Tree 组件就能正确传递文件信息
          dataRef: {
            name: item.script_name,
            id: String(Number(item.script_file_id) || item.script_id),
            script_id: item.script_id,
            type: PythonItemType.Notebook,
            perms: item.perms
          }
        };
      }) ?? []
    );
  }, []);

  // 文件夹点击处理
  const handleFolderClick = useCallback(
    async (folderId: string) => {
      try {
        const res = await getSqlScriptList({
          search_content: searchValue,
          page: 1,
          page_size: 1000
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
      const res = await getSqlScriptList({
        page: 1,
        page_size: 1000
      });
      return res?.data?.items || [];
    } catch (error) {
      console.error('返回父级失败:', error);
      Message.error('返回父级失败');
      return [];
    }
  }, []);

  // 监听外部选中状态变化，同步到内部状态
  useEffect(() => {
    console.log('externalSelectedKeys', externalSelectedKeys);
    if (externalSelectedKeys) {
      setSelectedKeys(externalSelectedKeys);
    }
  }, [externalSelectedKeys]);

  // 刷新当前目录
  const refreshDirectory = useCallback(async () => {
    await getRawSqlScriptList();
  }, [getRawSqlScriptList]);

  // 选中指定文件
  const selectFile = useCallback((fileId: string) => {
    setSelectedKeys([String(fileId)]);
  }, []);

  // 组件挂载时获取数据
  useEffect(() => {
    getRawSqlScriptList();
  }, []); // 只在组件挂载时执行一次

  return {
    // 状态
    sqlScriptList,
    searchValue,
    expandedKeys,
    isLoading,
    selectedKeys,

    // 操作函数
    generateDefaultName,
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
    getRawSqlScriptList,
    formatData,
    refreshDirectory,
    selectFile
  };
};
