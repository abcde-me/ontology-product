import { useState, useCallback, useRef } from 'react';
import { Message } from '@arco-design/web-react';
import { DirectoryTreeRef } from '../components/directory-tree/DirectoryTree';
import generateSqlDefaultName from '../utils/generateSqlDefaultName';
import { getSqlScriptDetail, createSqlScript } from '@/api/sql';
import { useUrlState } from './useUrlState';
import { useUserInfo } from '@/store/userInfoStore';

// 文件标签页类型
export interface FileTab {
  key: string;
  title: string;
  content: string;
  fileId?: string;
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

export const useTabManager = (
  onSelectedKeysChange?: (selectedKeys: string[]) => void
) => {
  const [fileState, setFileState] = useState<FileState>(initialState);
  const userInfo = useUserInfo();

  // DirectoryTree 的 ref，用于调用其新建功能
  const directoryTreeRef = useRef<DirectoryTreeRef>(null);

  const openFileByScriptId = useCallback(
    (scriptId: string) => {
      console.log('---openFileByScriptId---', scriptId, fileState.fileTabs);
      const existingTab = fileState.fileTabs.find(
        (tab) => tab.scriptId === scriptId
      );

      if (existingTab) {
        // 使用 setFileState 来切换标签页，避免循环依赖
        setFileState((prev) => {
          const targetTab = prev.fileTabs.find(
            (tab) => tab.key === existingTab.key
          );
          const fileId = targetTab?.fileId;
          const newSelectedKeys = fileId ? [fileId] : [];
          onSelectedKeysChange && onSelectedKeysChange(newSelectedKeys);
          return {
            ...prev,
            activeTab: existingTab.key,
            currentScriptId: scriptId || null,
            currentFileId: fileId || null,
            selectedKeys: newSelectedKeys
          };
        });
      } else {
        // 创建新标签页
        const tempId = `${Date.now()}`;
        const newTab = {
          key: tempId,
          title: `文件 ${scriptId}`,
          scriptId: scriptId,
          content: '',
          fileId: tempId,
          lastModified: undefined,
          hasRun: false
        };
        setFileState((prev) => ({
          ...prev,
          fileTabs: [...prev.fileTabs, newTab],
          activeTab: newTab.key,
          currentFileId: tempId,
          currentScriptId: scriptId
        }));
      }
    },
    [fileState.fileTabs, onSelectedKeysChange]
  );

  // 文件操作
  const openFile = useCallback(
    (fileId: string, scriptId: string, fileName?: string) => {
      try {
        setFileState((prev) => ({ ...prev, isLoading: true, error: null }));

        // 创建或更新标签页
        const existingTabIndex = fileState.fileTabs.findIndex(
          (tab) => tab.fileId === fileId
        );

        let updatedTabs: FileTab[];
        if (existingTabIndex >= 0) {
          // 如果标签页已存在，直接激活它
          setFileState((prev) => ({
            ...prev,
            currentFileId: fileId,
            currentScriptId: scriptId,
            activeTab: fileId,
            selectedKeys: [fileId], // 同步选中状态
            isLoading: false
          }));

          // 通知外部组件更新选中状态
          onSelectedKeysChange && onSelectedKeysChange([fileId]);
          return;
        } else {
          // 检查标签页数量限制
          if (fileState.fileTabs.length >= 20) {
            Message.error('最多只能打开20个标签页，请先关闭一些标签页');
            setFileState((prev) => ({ ...prev, isLoading: false }));
            return;
          }

          // 创建新标签页（内容由 useEditor 负责加载）
          const newTab = {
            key: fileId,
            title: fileName || `文件 ${fileId}`, // 使用传入的文件名或默认名称
            content: '', // 初始内容为空，由 useEditor 加载
            fileId: fileId,
            scriptId: scriptId,
            lastModified: new Date().toISOString()
          };
          updatedTabs = [...fileState.fileTabs, newTab];
        }

        setFileState((prev) => ({
          ...prev,
          fileTabs: updatedTabs,
          currentFileId: fileId,
          currentScriptId: scriptId,
          activeTab: fileId,
          selectedKeys: [fileId], // 同步选中状态
          isLoading: false
        }));

        // 通知外部组件更新选中状态
        onSelectedKeysChange && onSelectedKeysChange([fileId]);
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
    (newFileInfo?: any): FileTab | null => {
      // 检查标签页数量限制
      if (fileState.fileTabs.length >= 20) {
        Message.error('最多只能打开20个标签页，请先关闭一些标签页');
        return null;
      }

      let newTabKey: string;
      let newTabTitle: string;
      let newFileId: string | undefined;
      let newScriptId: string | undefined;

      if (newFileInfo) {
        // 如果有新文件信息，使用文件信息创建标签页
        newTabKey = newFileInfo.fileId || newFileInfo.scriptId;
        newTabTitle = newFileInfo.name;
        newFileId = newFileInfo.fileId || newFileInfo.scriptId;
        newScriptId = newFileInfo.scriptId;
      } else {
        // 否则创建临时标签页
        const tempStr = generateSqlDefaultName(new Date());
        const tempId = `${Date.now()}`;
        newTabKey = tempId;
        newTabTitle = tempStr;
        newFileId = tempId;
        newScriptId = undefined;
      }

      const newTab = {
        key: newTabKey,
        title: newTabTitle,
        scriptId: newScriptId,
        content: '',
        fileId: newFileId,
        lastModified: undefined,
        hasRun: false
      };

      setFileState((prev) => ({
        ...prev,
        fileTabs: [...prev.fileTabs, newTab],
        activeTab: newTab.key,
        currentFileId: newFileId || null, // 更新currentFileId
        currentScriptId: newScriptId || null
      }));

      return newTab;
    },
    [fileState.fileTabs.length]
  );

  const removeTab = useCallback(
    (key: string) => {
      const remainingTabs = fileState.fileTabs.filter((tab) => tab.key !== key);
      let newActiveTab = fileState.activeTab;
      let newSelectedKeys: string[] = [];
      let newCurrentFileId: string | null = null;
      let newCurrentScriptId: string | null = null;

      // 如果删除的是当前活动标签页，切换到下一个
      if (key === fileState.activeTab && remainingTabs.length > 0) {
        newActiveTab = remainingTabs[0].key;
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
      setFileState((prev) => {
        // 找到对应的标签页，获取其fileId
        const targetTab = prev.fileTabs.find((tab) => tab.key === key);
        const fileId = targetTab?.fileId;
        const scriptId = targetTab?.scriptId;
        const newSelectedKeys = fileId ? [fileId] : [];

        // 通知外部组件更新选中状态
        onSelectedKeysChange && onSelectedKeysChange(newSelectedKeys);

        return {
          ...prev,
          activeTab: key,
          currentScriptId: scriptId || null,
          currentFileId: fileId || null, // 更新currentFileId
          selectedKeys: newSelectedKeys
        };
      });
    },
    [fileState.fileTabs, onSelectedKeysChange]
  );

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

        // 只有当 activeTab 实际发生变化时才更新，避免不必要的状态更新
        const newState: Partial<FileState> = {
          fileTabs: newFileTabs
        };

        if (prev.activeTab !== tabData.key) {
          newState.activeTab = tabData.key;
        }

        return {
          ...prev,
          ...newState
        };
      });
    },
    [fileState.fileTabs, fileState.activeTab]
  );

  const handleCreate = useCallback(async (): Promise<any> => {
    // 检查标签页数量限制
    if (fileState.fileTabs.length >= 20) {
      Message.error('最多只能打开20个标签页，请先关闭一些标签页');
      return null;
    }

    // 生成默认名称
    const defaultName = generateSqlDefaultName(new Date());

    // 先创建临时标签页
    const tempTab = addTab();

    if (!tempTab) {
      return;
    }

    try {
      // 调用API创建脚本
      const createRes = await createSqlScript({
        uid: userInfo?.id ?? '',
        script_file_id: tempTab.fileId ?? '',
        script_name: defaultName,
        script_content: '',
        script_desc: ''
      });

      if (createRes.status !== 200 || !createRes.data.script_id) {
        Message.error(createRes.message || '创建失败');
        // 如果创建失败，移除刚添加的临时标签页
        if (tempTab.key) {
          removeTab(tempTab.key);
        }
        return null;
      }

      const scriptId = String(createRes.data.script_id);
      Message.success('创建成功');

      // 更新当前活动标签页的 scriptId
      setFileState((prev) => {
        const activeTabKey = prev.activeTab || tempTab.fileId;
        const updatedTabs = prev.fileTabs.map((tab) => {
          if (tab.key === activeTabKey) {
            return {
              ...tab,
              scriptId: scriptId,
              fileId: createRes.data.script_file_id || scriptId, // 使用返回的 script_file_id 或 scriptId
              title: defaultName
            };
          }
          return tab;
        });

        return {
          ...prev,
          fileTabs: updatedTabs,
          currentScriptId: scriptId,
          currentFileId: createRes.data.script_file_id || scriptId,
          selectedKeys: [createRes.data.script_file_id || scriptId]
        };
      });

      // 通知外部组件更新选中状态
      onSelectedKeysChange && onSelectedKeysChange([createRes.data.script_id]);

      // 刷新目录
      // if (directoryTreeRef.current?.refresh) {
      //   await directoryTreeRef.current.refresh();
      // }

      return createRes.data;
    } catch (error) {
      console.error('创建失败:', error);
      Message.error('创建失败');
      // 如果创建失败，移除刚添加的临时标签页
      if (tempTab.key) {
        removeTab(tempTab.key);
      }
      return null;
    }
  }, [
    fileState.fileTabs.length,
    fileState.activeTab,
    addTab,
    removeTab,
    onSelectedKeysChange,
    userInfo?.id
  ]);

  // 更新标签页标题的函数
  const updateTabTitle = useCallback((fileId: string, newTitle: string) => {
    setFileState((prev) => ({
      ...prev,
      fileTabs: prev.fileTabs.map((tab) =>
        tab.fileId === fileId ? { ...tab, title: newTitle } : tab
      )
    }));
  }, []);

  return {
    fileState,
    directoryTreeRef,
    openFile,
    addTab,
    removeTab,
    removeTabByFileId, // 导出根据文件ID关闭标签页的方法
    switchTab,
    updateTab,
    handleCreate,
    updateTabTitle, // 导出更新标签页标题的函数
    openFileByScriptId
  };
};
