import { useState, useCallback, useEffect, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { useLocation, useHistory } from 'react-router-dom';
import { getSqlScriptList } from '@/api/sql';
import {
  listDevelopScript,
  createDevelopScript,
  renameDevelopScript,
  copyDevelopScript,
  deleteDevelopScript
} from '@/api/sql-develop';
import { PythonItemType } from '@/types/pythonApi';
import { SqlScriptItem } from '@/types/sqlApi';
import { generateSqlDefaultName } from '../utils';
import { useUserInfo } from '@/store/userInfoStore';
import { validateName } from '@/utils/valiate';
import { ListDevelopScriptItem } from '@/types/sqlDevelopApi';
import { FileTab } from './useDevelopScriptTabManager';

interface UseFileManagerOptions {
  onFileOpen?: (fileId: string, scriptId: string, fileName?: string) => void;
  onFileDelete?: (fileId: string) => void; // 删除文件时关闭标签页的回调
  onFileRename?: (fileId: string, newName: string) => void; // 重命名文件时更新标签页标题的回调
  externalSelectedKeys?: string[]; // 外部传入的选中状态
  activeTab?: string; // 当前激活的 tab，用于判断是否在 files tab
  fileTabs?: FileTab[]; // 已打开的标签页列表
  onSwitchTab?: (key: string) => void; // 切换标签页的回调
}

interface UseFileManagerReturn {
  // 状态
  sqlScriptList: ListDevelopScriptItem[];
  searchValue: string;
  expandedKeys: string[];
  isLoading: boolean;
  selectedKeys: string[];

  // 操作函数
  generateDefaultName: (node: any) => string;
  handleSearch: (
    path_id: string,
    searchValue: string
  ) => Promise<ListDevelopScriptItem[]>;
  handleNew: () => void;
  handleTreeSelect: (selectedKeys: string[]) => void;
  handleTreeExpand: (keys: string[]) => void;
  handleCreate: (finalName: string, node: any) => Promise<any>;
  handleRename: (finalName: string, node: any) => Promise<any>;
  handleCopy: (newName: string, node: any) => Promise<any>;
  handleDelete: (node: any) => Promise<boolean>;
  handleFolderClick: (folderId: string) => Promise<ListDevelopScriptItem[]>;
  handleBackToParent: (parentId: string) => Promise<ListDevelopScriptItem[]>;

  // 工具函数
  getRawSqlScriptList: () => Promise<void>;
  formatData: (data: unknown[]) => any[];
  refreshDirectory: () => Promise<void>; // 刷新目录
  selectFile: (fileId: string) => void; // 选中文件
}

export const useDevelopScriptManager = (
  options: UseFileManagerOptions = {}
): UseFileManagerReturn => {
  const userInfo = useUserInfo();
  const location = useLocation();
  const history = useHistory();
  const {
    onFileOpen,
    onFileDelete,
    onFileRename,
    externalSelectedKeys,
    activeTab,
    fileTabs = [],
    onSwitchTab
  } = options;

  // 状态管理
  const [sqlScriptList, setSqlScriptList] = useState<ListDevelopScriptItem[]>(
    []
  );
  const [searchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]); // 添加选中状态

  const generateDefaultName = useCallback(() => {
    // 生成默认文件名：SQL查询 + 时间戳
    return generateSqlDefaultName(new Date());
  }, []);

  // 搜索功能
  const handleSearch = useCallback(
    async (path_id: string, searchValue: string) => {
      try {
        if (isLoading) return [];

        setIsLoading(true);

        const res = await listDevelopScript({
          script_name: searchValue,
          page: 1,
          page_size: 1000
        });

        setIsLoading(false);

        if (res.status === 200) {
          return res.data?.items ?? [];
        }
        return [];
      } catch (error) {
        console.error('搜索失败:', error);
        Message.error('搜索失败');
        setIsLoading(false);
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

        // 如果点击的是文件（不是文件夹），自动打开并更新URL
        if (dataRef && dataRef.type !== PythonItemType.Directory) {
          const scriptId = String(dataRef.script_id);
          console.log(
            '📁 点击文件，自动打开:',
            dataRef.name,
            'ID:',
            dataRef.id,
            'ScriptId:',
            scriptId
          );

          onFileOpen(String(dataRef.id), scriptId, dataRef.name);
        }
      }
    },
    [onFileOpen, location.pathname, location.search, history]
  );

  // 树展开处理
  const handleTreeExpand = useCallback((keys: string[]) => {
    setExpandedKeys(keys);
  }, []);

  // 获取原始SqlScript列表
  const getRawSqlScriptList = useCallback(async () => {
    if (isLoading) return; // 防止重复请求

    console.log('getRawSqlScriptList', isLoading);

    setIsLoading(true);
    try {
      const rawSqlScriptListRes = await listDevelopScript({
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
  }, []);

  // 创建文件/文件夹
  const handleCreate = useCallback(
    async (finalName: string) => {
      try {
        if (!validateName(finalName).isValid) {
          Message.error(
            validateName(finalName)?.errorMessage ?? '命名不符合规则'
          );
          return;
        }

        const scriptFileId = String(Date.now());
        const createRes = await createDevelopScript({
          script_name: finalName,
          script_context: '',
          script_desc: '',
          script_params: []
        });

        if (createRes.status !== 200) {
          Message.error(createRes.message);
          return;
        }

        Message.success('创建成功');

        // 刷新列表
        await getRawSqlScriptList();

        // 更新URL参数 activeDevelopScriptId
        const scriptId = String(createRes.data.script_id);

        // 设置选中状态为 script_id
        setSelectedKeys([scriptId]);

        // 编辑器自动打开当前脚本（fileId 使用 script_file_id，scriptId 使用 script_id）
        onFileOpen && onFileOpen(scriptFileId, scriptId, finalName);

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
        const scriptId = node?.dataRef?.script_id;
        const fileId = node?.dataRef?.id;
        const renameRes = await renameDevelopScript({
          script_id: scriptId,
          script_name: finalName ?? ''
        });

        if (renameRes.status !== 200) {
          Message.error(renameRes.message);
          return null;
        }

        Message.success('重命名成功');

        // 刷新列表
        await getRawSqlScriptList();

        // 如果重命名的是文件，更新对应的标签页标题
        if (fileId && onFileRename) {
          onFileRename(String(fileId), finalName);
        }

        return renameRes.data;
      } catch (error) {
        console.error('重命名失败:', error);
        Message.error('重命名失败');
        return null;
      }
    },
    [getRawSqlScriptList, onFileRename]
  );

  // 复制一个新脚本
  const handleCopy = useCallback(
    async (newName: string, node: any) => {
      try {
        const copyRes = await copyDevelopScript({
          script_id: node?.dataRef?.script_id
        });

        if (copyRes.status !== 200) {
          Message.error(copyRes.message);
          return null;
        }

        Message.success('复制成功');
        // 刷新列表
        await getRawSqlScriptList();

        // 自动打开新复制的脚本
        const newScriptId = String(copyRes.data?.script_id ?? '');
        const newFileId = String(
          (copyRes.data as any)?.script_file_id ?? copyRes.data?.script_id ?? ''
        );
        const newFileName = copyRes.data?.script_name || newName;

        if (newScriptId) {
          setSelectedKeys([newScriptId]);
          onFileOpen && onFileOpen(newFileId, newScriptId, newFileName);
        }

        return copyRes.data;
      } catch (error) {
        console.error('复制失败:', error);
        Message.error('复制失败');
        return null;
      }
    },
    [getRawSqlScriptList, onFileOpen]
  );

  // 删除
  const handleDelete = useCallback(
    async (node: any) => {
      try {
        const scriptId = node?.dataRef?.script_id;
        const fileId = node?.dataRef?.id;
        const deleteRes = await deleteDevelopScript({
          script_id: scriptId
        });

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
          key: String(item.script_id), // ✅ 统一使用 script_id 作为 key，Tree组件需要这个来管理选中状态
          // 确保每个节点都有 dataRef 属性，这样 Tree 组件就能正确传递文件信息
          dataRef: {
            name: item.script_name,
            status: item.status,
            id: String(Number(item.script_file_id) || item.script_id),
            script_id: item.script_id,
            type: PythonItemType.Notebook
          }
        };
      }) ?? []
    );
  }, []);

  // 文件夹点击处理
  const handleFolderClick = useCallback(async () => {
    try {
      if (isLoading) return [];

      setIsLoading(true);
      const res = await listDevelopScript({
        script_name: searchValue,
        page: 1,
        page_size: 1000
      });
      return res?.data?.items ?? [];
    } catch (error) {
      console.error('获取文件夹内容失败:', error);
      Message.error('获取文件夹内容失败');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [searchValue]);

  // 返回父级处理
  const handleBackToParent = useCallback(async () => {
    try {
      if (isLoading) return [];

      setIsLoading(true);
      const res = await listDevelopScript({
        page: 1,
        page_size: 1000
      });
      return res?.data?.items || [];
    } catch (error) {
      console.error('返回父级失败:', error);
      Message.error('返回父级失败');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // 用于跟踪是否已经根据外部选中状态打开过文件，避免重复打开
  const hasOpenedFileFromExternalRef = useRef<string | null>(null);

  // 监听外部选中状态变化，同步到内部状态并自动打开文件
  // 注意：externalSelectedKeys 传入的是 script_id，直接使用即可
  useEffect(() => {
    const hasExternalSelection =
      Array.isArray(externalSelectedKeys) && externalSelectedKeys.length > 0;
    const scriptIdFromUrl = hasExternalSelection
      ? String(externalSelectedKeys[0])
      : undefined;

    // 如果文件列表还未加载完成，等待加载完成后再处理
    if (sqlScriptList.length === 0) {
      if (!hasExternalSelection) {
        setSelectedKeys([]);
        hasOpenedFileFromExternalRef.current = null;
      }
      return;
    }

    // 先尝试使用 URL 中的 scriptId，找不到则回退到列表中的第一个文件
    const resolvedFile = scriptIdFromUrl
      ? sqlScriptList.find(
          (item) => String(item.script_id) === String(scriptIdFromUrl)
        )
      : sqlScriptList[0];
    // const resolvedFile = targetFile ?? sqlScriptList[0];

    if (!resolvedFile) {
      setSelectedKeys(scriptIdFromUrl ? [scriptIdFromUrl] : []);
      hasOpenedFileFromExternalRef.current = null;
      return;
    }

    const resolvedScriptId = String(resolvedFile.script_id);
    const resolvedFileId = String(
      Number((resolvedFile as any).script_file_id) || resolvedFile.script_id
    );
    const resolvedFileName = resolvedFile.script_name;

    setSelectedKeys([resolvedScriptId]);

    // 如果已经处理过同一个文件，则不重复打开，直接确保选中即可
    if (hasOpenedFileFromExternalRef.current === resolvedScriptId) {
      return;
    }

    const isAlreadyOpen = fileTabs.some(
      (tab) =>
        tab.scriptId === resolvedScriptId || tab.fileId === resolvedFileId
    );

    if (!isAlreadyOpen) {
      // 如果未打开，则打开文件
      onFileOpen &&
        onFileOpen(resolvedFileId, resolvedScriptId, resolvedFileName);
    } else {
      // 如果已经打开，切换到该标签页
      const existingTab = fileTabs.find(
        (tab) =>
          tab.scriptId === resolvedScriptId || tab.fileId === resolvedFileId
      );
      if (existingTab && onSwitchTab) {
        onSwitchTab(existingTab.key);
      }
    }

    hasOpenedFileFromExternalRef.current = resolvedScriptId;
  }, [externalSelectedKeys, sqlScriptList, onFileOpen, fileTabs, onSwitchTab]);

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
