import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import DirectoryTree, {
  type TreeNodeItem,
  DirectoryTreeRef
} from '../../components/directory-tree/DirectoryTree';
import { useFileManager } from '../../hooks/useFileManager';

interface NotebookTabContentProps {
  type: 'files' | 'tools' | 'data';
  onFileOpen?: (fileId: string, fileName?: string) => void;
  onFileDelete?: (fileId: string) => void; // 添加删除文件时关闭标签页的回调
  onFileRename?: (fileId: string, newName: string) => void; // 添加重命名文件时更新标签页标题的回调
  hasOpenTabs?: () => boolean; // 检查是否有标签页打开的回调
  directoryTreeRef?: React.Ref<DirectoryTreeRef>; // 修改：使用 Ref 而不是 RefObject
  externalSelectedKeys?: string[]; // 外部传入的选中状态
  onCurrentFolderChange?: (folderId: string) => void; // 添加当前文件夹变化的回调
  onCanCreateChange?: (isCanCreate: boolean) => void; // 添加创建权限变化的回调
}

const PythonTabContent: React.FC<NotebookTabContentProps> = ({
  onFileOpen,
  onFileDelete, // 接收删除文件时关闭标签页的回调
  onFileRename, // 接收重命名文件时更新标签页标题的回调
  hasOpenTabs, // 接收检查是否有标签页打开的回调
  directoryTreeRef,
  externalSelectedKeys,
  onCurrentFolderChange, // 接收当前文件夹变化的回调
  onCanCreateChange // 接收创建权限变化的回调
}) => {
  // 使用文件管理器hook
  const {
    pythonList,
    isCanCreate,
    selectedKeys,
    currentFolderId,
    handleSearch,
    handleTreeSelect,
    handleCreate,
    handleRename,
    handleCopy,
    handleDelete,
    // handleFileSelect,
    handleFolderClick,
    handleBackToParent,
    formatData,
    refreshDirectory,
    selectFile
  } = useFileManager({
    onFileOpen,
    onFileDelete, // 传递删除文件时关闭标签页的回调
    onFileRename, // 传递重命名文件时更新标签页标题的回调
    hasOpenTabs, // 传递检查是否有标签页打开的回调
    externalSelectedKeys
  });

  // 监听当前文件夹ID变化，通知父组件
  React.useEffect(() => {
    if (onCurrentFolderChange && currentFolderId) {
      onCurrentFolderChange(currentFolderId);
    }
  }, [currentFolderId, onCurrentFolderChange]);

  // 监听创建权限变化，通知父组件
  useEffect(() => {
    if (onCanCreateChange) {
      onCanCreateChange(isCanCreate);
    }
  }, [isCanCreate, onCanCreateChange]);

  // 暴露方法给父组件
  useImperativeHandle(
    directoryTreeRef,
    () => ({
      startRootCreate: () => {
        // 这里可以调用 DirectoryTree 的 startRootCreate 方法
        // 由于我们使用的是 DirectoryTree 组件，这个方法会通过 ref 传递
      },
      refresh: refreshDirectory,
      selectFile: selectFile
    }),
    [refreshDirectory, selectFile]
  );
  return (
    <div
      className={classNames(
        styles['python-tab-content'],
        styles['sider-container']
      )}
    >
      <div className={styles['sider-title']}>PySpark文件</div>

      <div className={styles['tab-tree']}>
        <DirectoryTree
          ref={directoryTreeRef} // 传递 ref
          data={pythonList}
          isCanCreate={isCanCreate}
          selectedKeys={selectedKeys} // 传递选中状态
          onSelect={handleTreeSelect} // 添加文件选择处理
          onCreate={handleCreate}
          onRename={handleRename}
          onCopy={handleCopy}
          onDelete={handleDelete}
          onFolderClick={(parentId?: string) =>
            handleFolderClick(parentId ?? '')
          }
          onBackToParent={(parentId?: string) =>
            handleBackToParent(parentId ?? '')
          }
          onSearch={handleSearch}
          formatData={formatData}
          placeholder="输入搜索文件"
          newButtonText="新建"
        />
      </div>
    </div>
  );
};

// 使用 forwardRef 包装组件，使其能够接收 ref
export default forwardRef<DirectoryTreeRef, NotebookTabContentProps>(
  function FileManager(props, ref) {
    return <PythonTabContent {...props} directoryTreeRef={ref} />;
  }
);
