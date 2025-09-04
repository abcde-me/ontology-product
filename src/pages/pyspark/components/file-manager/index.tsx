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
  directoryTreeRef?: React.Ref<DirectoryTreeRef>; // 修改：使用 Ref 而不是 RefObject
}

const PythonTabContent: React.FC<NotebookTabContentProps> = ({
  onFileOpen,
  directoryTreeRef
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
    onFileOpen
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
