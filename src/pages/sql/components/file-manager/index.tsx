import React, { forwardRef } from 'react';
import { Typography } from '@arco-design/web-react';
import styles from './index.module.scss';
import DirectoryTree, {
  type TreeNodeItem,
  DirectoryTreeFrom,
  DirectoryTreeRef
} from '@/components/directory-tree/DirectoryTree';
import { useFileManager } from '../../hooks/useFileManager';

const { Title } = Typography;

interface NotebookTabContentProps {
  type: 'files' | 'tools' | 'data';
  onFileOpen?: (fileId: string, scriptId: string, fileName?: string) => void;
  onFileDelete?: (fileId: string) => void; // 添加删除文件时关闭标签页的回调
  onFileRename?: (fileId: string, newName: string) => void; // 添加重命名文件时更新标签页标题的回调
  directoryTreeRef?: React.Ref<DirectoryTreeRef>; // 修改：使用 Ref 而不是 RefObject
  externalSelectedKeys?: string[]; // 外部传入的选中状态
}

const PythonTabContent: React.FC<NotebookTabContentProps> = ({
  onFileOpen,
  onFileDelete, // 接收删除文件时关闭标签页的回调
  onFileRename, // 接收重命名文件时更新标签页标题的回调
  directoryTreeRef,
  externalSelectedKeys
}) => {
  // 使用文件管理器hook
  const {
    sqlScriptList,
    selectedKeys,
    generateDefaultName,
    handleSearch,
    handleTreeSelect,
    handleCreate,
    handleRename,
    handleCopy,
    handleDelete,
    // handleFileSelect,
    handleFolderClick,
    handleBackToParent,
    formatData
  } = useFileManager({
    onFileOpen,
    onFileDelete, // 传递删除文件时关闭标签页的回调
    onFileRename, // 传递重命名文件时更新标签页标题的回调
    externalSelectedKeys
  });

  return (
    <div className={styles['sql-tab-content']}>
      <div className={styles['tab-header']}>
        <Title className={styles['tab-title']}>SQL脚本列表</Title>
      </div>

      <div className={`${styles['tab-tree']} ${styles['sider-container']}`}>
        <DirectoryTree
          ref={directoryTreeRef} // 传递 ref
          from={DirectoryTreeFrom.SQL}
          data={sqlScriptList as TreeNodeItem[]}
          selectedKeys={selectedKeys} // 传递选中状态
          generateDefaultName={generateDefaultName}
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
