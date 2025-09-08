import { useState, useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { DirectoryTreeRef } from '@/components/directory-tree/DirectoryTree';

// 文件标签页类型
export interface FileTab {
  key: string;
  title: string;
  content: string;
  fileId?: string;
  lastModified?: string;
}

// 文件状态类型
export interface FileState {
  fileTabs: FileTab[];
  activeTab: string;
}

// 初始状态
const initialState: FileState = {
  fileTabs: [],
  activeTab: ''
};

export const useTabManager = () => {
  const [fileState, setFileState] = useState<FileState>(initialState);

  // DirectoryTree 的 ref，用于调用其新建功能
  const directoryTreeRef = useRef<DirectoryTreeRef>(null);

  // 打开文件 - 只创建或切换到标签页，不请求文件内容
  const openFile = useCallback(
    (fileId: string, fileName?: string) => {
      const newTabKey = `file-${fileId}`;
      const existingTabIndex = fileState.fileTabs.findIndex(
        (tab) => tab.fileId === fileId
      );

      let updatedTabs: FileTab[];
      if (existingTabIndex >= 0) {
        // 如果标签页已存在，只切换活动标签页
        updatedTabs = fileState.fileTabs;
      } else {
        // 创建新标签页
        const newTab = {
          key: newTabKey,
          title: fileName || `文件 ${fileId}`,
          content: '', // 初始内容为空，由 useEditor 负责加载
          fileId: fileId,
          lastModified: new Date().toISOString()
        };
        updatedTabs = [...fileState.fileTabs, newTab];
      }

      setFileState((prev) => ({
        ...prev,
        fileTabs: updatedTabs,
        activeTab: newTabKey
      }));
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
        newTabKey = `notebook-${Date.now()}`;
        newTabTitle = `新建笔记本 ${fileState.fileTabs.length + 1}`;
        newFileId = undefined;
      }

      const newTab = {
        key: newTabKey,
        title: newTabTitle,
        content: '',
        fileId: newFileId,
        lastModified: undefined
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
    // 只切换活动标签页
    setFileState((prev) => ({
      ...prev,
      activeTab: key
    }));
  }, []);

  // 更新标签页内容
  const updateTabContent = useCallback((tabKey: string, content: string) => {
    setFileState((prev) => ({
      ...prev,
      fileTabs: prev.fileTabs.map((tab) =>
        tab.key === tabKey
          ? { ...tab, content, lastModified: new Date().toISOString() }
          : tab
      )
    }));
  }, []);

  // 从 FileManager 获取创建文件的函数
  const handleCreate = useCallback(
    (finalName: string, node?: any): Promise<any> => {
      return new Promise((resolve) => {
        try {
          // 直接调用 DirectoryTree 的新建 PySpark 功能
          if (directoryTreeRef.current) {
            directoryTreeRef.current.startRootCreate(false); // false 表示创建文件，不是文件夹
            resolve(null); // 返回 null，因为 DirectoryTree 会自己处理创建逻辑
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('调用新建功能失败:', error);
          Message.error('调用新建功能失败');
          resolve(null);
        }
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
    updateTabContent,
    handleCreate
  };
};
