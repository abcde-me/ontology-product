import { useState, useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { DirectoryTreeRef } from '../components/directory-tree/DirectoryTree';
import { createPythonItem } from '@/api/pyspark';
import { PythonItemType } from '@/types/pythonApi';

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
  selectedKeys: string[]; // 添加选中状态管理
}

// 初始状态
const initialState: FileState = {
  fileTabs: [],
  activeTab: '',
  selectedKeys: []
};

export const useTabManager = (
  onSelectedKeysChange?: (selectedKeys: string[]) => void,
  getCurrentFolderId?: () => string, // 添加获取当前文件夹ID的回调
  refreshDirectory?: () => Promise<void>, // 刷新目录的方法
  selectFile?: (fileId: string) => void // 选中文件的方法
) => {
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
        activeTab: newTabKey,
        selectedKeys: [fileId] // 同步选中状态
      }));

      // 通知FileManager更新选中状态
      onSelectedKeysChange?.([fileId]);
    },
    [fileState.fileTabs, onSelectedKeysChange]
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
      let newSelectedKeys: string[] = [];

      // 如果删除的是当前活动标签页，切换到下一个
      if (key === fileState.activeTab && remainingTabs.length > 0) {
        newActiveTab = remainingTabs[0].key;
        // 获取新活动标签页的fileId
        const newActiveTabData = remainingTabs[0];
        if (newActiveTabData.fileId) {
          newSelectedKeys = [newActiveTabData.fileId];
        }
      }

      setFileState((prev) => ({
        ...prev,
        fileTabs: remainingTabs,
        activeTab: newActiveTab,
        selectedKeys: newSelectedKeys
      }));

      // 通知FileManager更新选中状态
      onSelectedKeysChange?.(newSelectedKeys);
    },
    [fileState.fileTabs, fileState.activeTab, onSelectedKeysChange]
  );

  // 根据文件ID关闭标签页
  const removeTabByFileId = useCallback(
    (fileId: string) => {
      const tabToRemove = fileState.fileTabs.find(
        (tab) => tab.fileId === String(fileId)
      );
      if (tabToRemove) {
        removeTab(tabToRemove.key);
      }
    },
    [fileState.fileTabs, removeTab]
  );

  const switchTab = useCallback(
    (key: string) => {
      // 找到对应的标签页，获取fileId
      const targetTab = fileState.fileTabs.find((tab) => tab.key === key);
      const fileId = targetTab?.fileId;

      // 切换活动标签页并同步选中状态
      setFileState((prev) => ({
        ...prev,
        activeTab: key,
        selectedKeys: fileId ? [fileId] : []
      }));

      // 通知FileManager更新选中状态
      if (fileId) {
        onSelectedKeysChange?.([fileId]);
      }
    },
    [fileState.fileTabs, onSelectedKeysChange]
  );

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

  // 更新标签页标题
  const updateTabTitle = useCallback((fileId: string, newTitle: string) => {
    setFileState((prev) => ({
      ...prev,
      fileTabs: prev.fileTabs.map((tab) =>
        tab.fileId === fileId ? { ...tab, title: newTitle } : tab
      )
    }));
  }, []);

  // 从 FileManager 获取创建文件的函数
  const handleCreate = useCallback(
    (finalName: string): Promise<any> => {
      return new Promise(async (resolve) => {
        try {
          // 获取当前文件夹ID，如果没有则使用根目录
          const currentFolderId = getCurrentFolderId?.() || '0';
          const createRes = await createPythonItem({
            path_id: Number(currentFolderId),
            type: PythonItemType.Notebook,
            name: finalName
          });

          if (createRes.status !== 200) {
            Message.error(createRes?.message ?? '创建失败');
            resolve(null);
            return;
          }

          Message.success('创建成功');

          // 如果是创建的文件（不是文件夹），自动在编辑器中打开
          if (
            createRes.data &&
            createRes.data.type !== PythonItemType.Directory
          ) {
            console.log(
              '✅ 新建文件成功，自动打开文件:',
              createRes.data.name,
              'ID:',
              createRes.data.id
            );

            // 刷新目录列表
            if (refreshDirectory) {
              await refreshDirectory();
            }

            // 选中新创建的文件
            if (selectFile) {
              selectFile(String(createRes.data.id));
            }

            // 自动打开文件
            openFile(String(createRes.data.id), createRes.data.name);
          }

          resolve(createRes.data);
        } catch (error) {
          console.error('创建失败:', error);
          Message.error('创建失败');
          resolve(null);
        }
      });
    },
    [getCurrentFolderId, openFile]
  );

  // 检查是否有标签页打开
  const hasOpenTabs = useCallback(() => {
    return fileState.fileTabs.length > 0;
  }, [fileState.fileTabs.length]);

  return {
    fileState,
    directoryTreeRef,
    openFile,
    addTab,
    removeTab,
    removeTabByFileId, // 导出根据文件ID关闭标签页的方法
    switchTab,
    updateTabContent,
    updateTabTitle, // 导出更新标签页标题的方法
    handleCreate,
    hasOpenTabs // 导出检查是否有标签页打开的方法
  };
};
