import React, { forwardRef } from 'react';
import { Typography } from '@arco-design/web-react';
import { PythonListItem } from '@/types/pythonApi';
import './index.scss';
import DirectoryTree, {
  type TreeNodeItem,
  DirectoryTreeRef
} from '@/components/directory-tree/DirectoryTree';
import { useFileManager } from '../../hooks/useFileManager';

const { Title } = Typography;

interface NotebookTabContentProps {
  type: 'files' | 'tools' | 'data';
  onFileOpen?: (fileId: string, fileName?: string) => void;
  onFileDelete?: (fileId: string) => void; // 添加删除文件时关闭标签页的回调
  directoryTreeRef?: React.Ref<DirectoryTreeRef>; // 修改：使用 Ref 而不是 RefObject
  externalSelectedKeys?: string[]; // 外部传入的选中状态
}

const PythonTabContent: React.FC<NotebookTabContentProps> = ({
  onFileOpen,
  onFileDelete, // 接收删除文件时关闭标签页的回调
  directoryTreeRef,
  externalSelectedKeys
}) => {
  // 使用文件管理器hook
  const {
    pythonList,
    selectedKeys,
    handleSearch,
    handleNew,
    handleTreeSelect,
    handleTreeExpand,
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
    externalSelectedKeys
  });

  return (
    <div className="python-tab-content sider-container">
      <div className="sider-title">PySpark文件</div>

      <div className="tab-tree">
        <DirectoryTree
          ref={directoryTreeRef} // 传递 ref
          data={pythonList as TreeNodeItem[]}
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
          placeholder="搜索当前文件夹"
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
