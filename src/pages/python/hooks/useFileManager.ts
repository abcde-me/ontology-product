import { useCallback } from 'react';
import { usePythonContext } from '../context/PythonContext';

/**
 * 文件管理Hook
 * 提供文件操作的基础逻辑，包括打开、关闭、保存等操作
 */
export const useFileManager = () => {
  const { state, openFile, closeFile, saveFile, addTab, removeTab, switchTab } =
    usePythonContext();

  // 获取当前文件信息
  const currentFile = state.files.fileTabs.find(
    (tab) => tab.fileId === state.files.currentFileId
  );

  // 获取当前活动标签页
  const activeTab = state.files.fileTabs.find(
    (tab) => tab.key === state.files.activeTab
  );

  // 检查文件是否有未保存的更改
  const hasUnsavedChanges = state.editor.isDirty;

  // 检查是否可以关闭文件
  const canCloseFile = useCallback(
    (fileId: string) => {
      const tab = state.files.fileTabs.find((t) => t.fileId === fileId);
      if (!tab) return true;

      // 如果当前文件有未保存的更改，需要提示用户
      if (fileId === state.files.currentFileId && hasUnsavedChanges) {
        return false;
      }

      return true;
    },
    [state.files.fileTabs, state.files.currentFileId, hasUnsavedChanges]
  );

  // 安全关闭文件
  const safeCloseFile = useCallback(
    (fileId: string) => {
      if (!canCloseFile(fileId)) {
        // 这里可以触发一个确认对话框
        // 暂时直接返回，不关闭
        return false;
      }

      closeFile(fileId);
      return true;
    },
    [canCloseFile, closeFile]
  );

  // 创建新标签页
  const createNewTab = useCallback(
    (title?: string) => {
      const newTabKey = `new-${Date.now()}`;
      const newTab = {
        key: newTabKey,
        title: title || `新建文件 ${state.files.fileTabs.length + 1}`,
        content: '',
        fileId: undefined,
        lastModified: undefined
      };

      addTab(newTab);
      return newTabKey;
    },
    [addTab, state.files.fileTabs.length]
  );

  // 重命名标签页
  const renameTab = useCallback(
    (key: string, newTitle: string) => {
      const tab = state.files.fileTabs.find((t) => t.key === key);
      if (tab) {
        // 这里可以调用API重命名文件
        // 暂时只更新本地状态
        // TODO: 实现文件重命名API调用
      }
    },
    [state.files.fileTabs]
  );

  // 获取文件统计信息
  const getFileStats = useCallback(() => {
    return {
      totalTabs: state.files.fileTabs.length,
      openFiles: state.files.fileTabs.filter((tab) => tab.fileId).length,
      newFiles: state.files.fileTabs.filter((tab) => !tab.fileId).length,
      hasUnsavedChanges
    };
  }, [state.files.fileTabs, hasUnsavedChanges]);

  // 批量操作
  const closeAllTabs = useCallback(() => {
    const tabsToClose = state.files.fileTabs.filter((tab) => {
      if (tab.fileId) {
        return canCloseFile(tab.fileId);
      }
      return true; // 新文件可以直接关闭
    });

    for (const tab of tabsToClose) {
      if (tab.fileId) {
        safeCloseFile(tab.fileId);
      }
    }

    // 关闭所有标签页后，创建一个新的空白标签页
    if (state.files.fileTabs.length === 0) {
      createNewTab();
    }
  }, [state.files.fileTabs, canCloseFile, safeCloseFile, createNewTab]);

  const closeOtherTabs = useCallback(
    (keepKey: string) => {
      const tabsToClose = state.files.fileTabs.filter(
        (tab) => tab.key !== keepKey
      );

      for (const tab of tabsToClose) {
        if (tab.fileId) {
          safeCloseFile(tab.fileId);
        }
      }
    },
    [state.files.fileTabs, safeCloseFile]
  );

  // 文件拖拽排序（预留接口）
  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    // TODO: 实现标签页拖拽排序
    console.log('Reorder tabs:', { fromIndex, toIndex });
  }, []);

  // 导出文件内容
  const exportFile = useCallback(
    (fileId: string, format: 'txt' | 'py' = 'py') => {
      const tab = state.files.fileTabs.find((t) => t.fileId === fileId);
      if (!tab) return;

      const content = tab.content;
      const fileName = `${tab.title}.${format}`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [state.files.fileTabs]
  );

  // 导入文件内容
  const importFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // 移除扩展名

        const newTabKey = createNewTab(fileName);
        // 更新标签页内容
        // TODO: 通过Context更新标签页内容
      };
      reader.readAsText(file);
    },
    [createNewTab]
  );

  return {
    // 状态
    currentFile,
    activeTab,
    hasUnsavedChanges,
    isLoading: state.files.isLoading,
    error: state.files.error,

    // 基础操作
    openFile,
    closeFile: safeCloseFile,
    saveFile,
    switchTab,

    // 标签页管理
    createNewTab,
    removeTab,
    renameTab,
    reorderTabs,

    // 批量操作
    closeAllTabs,
    closeOtherTabs,

    // 文件操作
    exportFile,
    importFile,

    // 工具方法
    canCloseFile,
    getFileStats
  };
};
