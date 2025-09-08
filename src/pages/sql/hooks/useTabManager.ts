import { useState, useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { getSqlScriptDetail, openPythonItem } from '@/api/sql';
import { DirectoryTreeRef } from '@/components/directory-tree/DirectoryTree';
import { formatDateTime } from '../utils';
import { generateSqlDefaultName } from '../utils/formatDateTime';

// 文件标签页类型
export interface FileTab {
  key: string;
  title: string;
  content: string;
  fileId?: string;
  lastModified?: string;
  hasRun?: boolean;
}

// 文件状态类型
export interface FileState {
  currentFileId: string | null;
  fileTabs: FileTab[];
  activeTab: string;
  isLoading: boolean;
  error: Error | null;
}

// 初始状态
const initialState: FileState = {
  currentFileId: null,
  fileTabs: [],
  activeTab: '',
  isLoading: false,
  error: null
};

export const useTabManager = () => {
  const [fileState, setFileState] = useState<FileState>(initialState);

  // DirectoryTree 的 ref，用于调用其新建功能
  const directoryTreeRef = useRef<DirectoryTreeRef>(null);

  // 文件操作
  const openFile = useCallback(
    (fileId: string, fileName?: string) => {
      try {
        setFileState((prev) => ({ ...prev, isLoading: true, error: null }));

        // 创建或更新标签页
        const newTabKey = `file-${fileId}`;
        const existingTabIndex = fileState.fileTabs.findIndex(
          (tab) => tab.fileId === fileId
        );

        let updatedTabs: FileTab[];
        if (existingTabIndex >= 0) {
          // 如果标签页已存在，直接激活它
          setFileState((prev) => ({
            ...prev,
            currentFileId: fileId,
            activeTab: newTabKey,
            isLoading: false
          }));
          return;
        } else {
          // 创建新标签页（内容由 useEditor 负责加载）
          const newTab = {
            key: newTabKey,
            title: fileName || `文件 ${fileId}`, // 使用传入的文件名或默认名称
            content: '', // 初始内容为空，由 useEditor 加载
            fileId: fileId,
            lastModified: new Date().toISOString()
          };
          updatedTabs = [...fileState.fileTabs, newTab];
        }

        setFileState((prev) => ({
          ...prev,
          fileTabs: updatedTabs,
          currentFileId: fileId,
          activeTab: newTabKey,
          isLoading: false
        }));
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('打开文件失败');
        setFileState((prev) => ({
          ...prev,
          error: errorObj,
          isLoading: false
        }));
        Message.error('打开文件失败');
      }
    },
    [fileState.fileTabs]
  );

  const addTab = useCallback(
    (newFileInfo?: any) => {
      let newTabKey: string;
      let newTabTitle: string;
      let newFileId: string | undefined;

      if (newFileInfo) {
        // 如果有新文件信息，使用文件信息创建标签页
        newTabKey = `notebook-${newFileInfo.id}`;
        newTabTitle = newFileInfo.name;
        newFileId = String(newFileInfo.id);
      } else {
        // 否则创建临时标签页
        const tempStr = generateSqlDefaultName(new Date());
        newTabKey = tempStr;
        newTabTitle = tempStr;
        newFileId = undefined;
      }

      const newTab = {
        key: newTabKey,
        title: newTabTitle,
        content: '',
        fileId: newFileId,
        lastModified: undefined,
        hasRun: false
      };

      setFileState((prev) => ({
        ...prev,
        fileTabs: [...prev.fileTabs, newTab],
        activeTab: newTab.key
      }));
    },
    [fileState.fileTabs.length]
  );

  const removeTab = useCallback(
    (key: string) => {
      const remainingTabs = fileState.fileTabs.filter((tab) => tab.key !== key);
      let newActiveTab = fileState.activeTab;

      // 如果删除的是当前活动标签页，切换到下一个
      if (key === fileState.activeTab && remainingTabs.length > 0) {
        newActiveTab = remainingTabs[0].key;
      }

      setFileState((prev) => ({
        ...prev,
        fileTabs: remainingTabs,
        activeTab: newActiveTab
      }));
    },
    [fileState.fileTabs, fileState.activeTab]
  );

  const switchTab = useCallback((key: string) => {
    setFileState((prev) => ({ ...prev, activeTab: key }));
  }, []);

  const updateTab = useCallback(
    (tabData: FileTab) => {
      setFileState((prev) => {
        const key = tabData.key;
        const newFileTabs = prev.fileTabs.map((item) => {
          if (item.key === key) {
            return {
              ...item,
              ...tabData
            };
          }
          return item;
        });
        return {
          ...prev,
          fileTabs: newFileTabs
        };
      });
    },
    [fileState.fileTabs, fileState.activeTab]
  );

  const handleCreate = useCallback(
    (finalName: string, node?: any): Promise<any> => {
      return new Promise((resolve) => {
        addTab();
        resolve(null);
      });
    },
    []
  );

  return {
    fileState,
    directoryTreeRef,
    openFile,
    addTab,
    removeTab,
    switchTab,
    updateTab,
    handleCreate
  };
};
