import { useState, useCallback, useRef, useEffect } from 'react';
import { Message } from '@arco-design/web-react';
import { DirectoryTreeRef } from '../components/directory-tree/DirectoryTree';
import generateSqlDefaultName from '../utils/generateSqlDefaultName';
import { getSqlScriptDetail, createSqlScript } from '@/api/sql';
import { useUrlState } from './useUrlState';
import { useUserInfo } from '@/store/userInfoStore';
import { RunningStatus } from '@/types/sqlApi';
import { validateName } from '@/utils/valiate';
import { removeQueryParams, useParams } from '@/utils/url';
import { useHistory } from 'react-router-dom';

// 文件标签页类型
export interface FileTab {
  key: string;
  title: string;
  content: string;
  fileId: string;
  scriptId?: string;
  lastModified?: string;
  hasRun?: boolean;
}

// 文件状态类型
export interface FileState {
  currentFileId: string | null;
  currentScriptId: string | null;
  fileTabs: FileTab[];
  activeTab: string;
  isLoading: boolean;
  error: Error | null;
  selectedKeys: string[]; // 添加选中状态
}

// 初始状态
const initialState: FileState = {
  currentFileId: null,
  currentScriptId: null,
  fileTabs: [],
  activeTab: '',
  isLoading: false,
  error: null,
  selectedKeys: [] // 添加选中状态初始值
};

export const useQueryScriptTabManager = (
  onSelectedKeysChange?: (selectedKeys: string[]) => void
) => {
  const activeScriptIdFromUrl = useParams('activeScriptId');
  // 根据 URL 中的 activeScriptId 初始化状态
  const [fileState, setFileState] = useState<FileState>(initialState);
  const userInfo = useUserInfo();
  const history = useHistory();

  const addTab = useCallback(
    (newFileInfo?: FileTab): FileTab | null => {
      // 检查标签页数量限制
      if (fileState.fileTabs.length >= 20) {
        Message.error('最多只能打开20个标签页，请先关闭一些标签页');
        return null;
      }

      const fileId = newFileInfo?.fileId ?? `${Date.now()}`;
      const title = newFileInfo?.fileId
        ? newFileInfo.title
        : generateSqlDefaultName(new Date());

      const newTab = {
        key: fileId,
        title,
        scriptId: newFileInfo?.scriptId ?? '',
        content: newFileInfo?.content ?? '',
        fileId,
        lastModified: newFileInfo?.lastModified ?? undefined,
        hasRun: newFileInfo?.hasRun ?? false
      };

      const existingTab = fileState.fileTabs.find(
        (tab) => tab.fileId === newFileInfo?.fileId
      );

      // 如果标签页已存在，更新标签页
      if (existingTab) {
        setFileState((prev) => ({
          ...prev,
          fileTabs: prev.fileTabs.map((tab) =>
            tab.fileId === newFileInfo?.fileId ? newTab : tab
          ),
          activeTab: fileId,
          currentFileId: fileId, // 更新currentFileId
          currentScriptId: newFileInfo?.scriptId ?? null
        }));
      } else {
        setFileState((prev) => ({
          ...prev,
          fileTabs: [...prev.fileTabs, newTab],
          activeTab: fileId,
          currentFileId: fileId, // 更新currentFileId
          currentScriptId: newFileInfo?.scriptId ?? null
        }));
      }

      onSelectedKeysChange && onSelectedKeysChange([fileId]);

      return newTab;
    },
    [fileState.fileTabs.length]
  );

  const removeTab = useCallback(
    (fileId: string) => {
      const remainingTabs = fileState.fileTabs.filter(
        (tab) => tab.fileId !== fileId
      );
      let newActiveTab = fileState.activeTab;
      let newSelectedKeys: string[] = [];
      let newCurrentFileId: string | null = null;
      let newCurrentScriptId: string | null = null;

      // 如果删除的是当前活动标签页，切换到下一个
      if (fileId === fileState.currentFileId && remainingTabs.length > 0) {
        newActiveTab = remainingTabs[0].fileId;
        // 更新选中状态为新的活动标签页
        newSelectedKeys = remainingTabs[0].fileId
          ? [remainingTabs[0].fileId]
          : [];
        newCurrentFileId = remainingTabs[0].fileId || null;
        newCurrentScriptId = remainingTabs[0].scriptId || null;
      }

      setFileState((prev) => ({
        ...prev,
        fileTabs: remainingTabs,
        activeTab: newActiveTab,
        currentFileId: newCurrentFileId, // 更新currentFileId
        currentScriptId: newCurrentScriptId,
        selectedKeys: newSelectedKeys
      }));

      // 通知外部组件更新选中状态
      onSelectedKeysChange && onSelectedKeysChange(newSelectedKeys);
    },
    [fileState.fileTabs, fileState.activeTab, onSelectedKeysChange]
  );

  const switchTab = useCallback(
    (targetFileId: string) => {
      setFileState((prev) => {
        // 找到对应的标签页，获取其fileId
        const targetTab = prev.fileTabs.find(
          (tab) => tab.fileId === targetFileId
        );

        if (!targetTab) {
          return prev;
        }

        const fileId = targetTab?.fileId;
        const scriptId = targetTab?.scriptId;
        const newSelectedKeys = fileId ? [fileId] : [];

        // 通知外部组件更新选中状态
        onSelectedKeysChange && onSelectedKeysChange(newSelectedKeys);

        return {
          ...prev,
          activeTab: fileId,
          currentScriptId: scriptId || null,
          currentFileId: fileId || null, // 更新currentFileId
          selectedKeys: newSelectedKeys
        };
      });
    },
    [fileState.fileTabs, onSelectedKeysChange]
  );

  const updateTab = useCallback(
    (newFileInfo: {
      fileId: string;
      title?: string;
      scriptId?: string;
      content?: string;
      lastModified?: string;
      hasRun?: boolean;
    }) => {
      setFileState((prev) => {
        const newFileTabs = prev.fileTabs.map((item) => {
          if (item.fileId === newFileInfo.fileId) {
            return {
              ...item,
              key: newFileInfo.fileId,
              fileId: newFileInfo.fileId,
              title: newFileInfo.title ?? '',
              scriptId: newFileInfo.scriptId ?? '',
              content: newFileInfo.content ?? '',
              lastModified: newFileInfo.lastModified ?? undefined,
              hasRun: newFileInfo.hasRun ?? false
            };
          }
          return item;
        });

        // 只有当 activeTab 实际发生变化时才更新，避免不必要的状态更新
        const newState: Partial<FileState> = {
          fileTabs: newFileTabs
        };

        return {
          ...prev,
          ...newState
        };
      });
    },
    [fileState.fileTabs, fileState.activeTab]
  );

  const openFileByScriptId = useCallback(
    async (scriptId: string) => {
      const targetTab = fileState.fileTabs.find(
        (tab) => tab.scriptId === scriptId
      );

      try {
        const sqlDetail = await getSqlScriptDetail(scriptId);
        if (
          sqlDetail.status !== 200 ||
          !sqlDetail.data ||
          !sqlDetail.data.script_id
        ) {
          Message.error(sqlDetail.message || '获取脚本详情失败');
          return;
        }

        if (targetTab) {
          updateTab({
            fileId: sqlDetail.data.script_file_id,
            title: sqlDetail.data.script_name,
            scriptId: String(sqlDetail.data.script_id),
            content: sqlDetail.data.script_content,
            lastModified: sqlDetail.data.update_time,
            hasRun: sqlDetail.data.run_status === RunningStatus.RUNNING
          });
          // 切换到这个标签页
          switchTab(sqlDetail.data.script_file_id);
        } else {
          addTab({
            key: sqlDetail.data.script_file_id,
            fileId: sqlDetail.data.script_file_id,
            title: sqlDetail.data.script_name,
            scriptId: String(sqlDetail.data.script_id),
            content: sqlDetail.data.script_content,
            lastModified: sqlDetail.data.update_time,
            hasRun: sqlDetail.data.run_status === RunningStatus.RUNNING
          });
        }
      } catch (error) {
        console.error('获取脚本详情失败:', error);
        Message.error('获取脚本详情失败');
        return;
      }
    },
    [fileState.fileTabs, updateTab, addTab, switchTab]
  );

  // 进入页面时，如果 URL 中有 activeScriptId，自动打开该脚本
  useEffect(() => {
    if (activeScriptIdFromUrl) {
      openFileByScriptId(activeScriptIdFromUrl);
      removeQueryParams(history, 'activeScriptId');
    }
  }, [activeScriptIdFromUrl]);

  useEffect(() => {
    if (fileState.fileTabs.length === 0) {
      addTab();
    }
  }, [fileState.fileTabs]);

  const createQueryScript = useCallback(
    async (finalName) => {
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

        openFileByScriptId(String(createRes.data.script_id));

        return createRes.data;
      } catch (error) {
        console.error('创建失败:', error);
        Message.error('创建失败');
        return null;
      }
    },
    [userInfo, openFileByScriptId]
  );

  return {
    fileState,
    addTab,
    removeTab,
    switchTab,
    updateTab,
    openFileByScriptId,
    createQueryScript
  };
};
