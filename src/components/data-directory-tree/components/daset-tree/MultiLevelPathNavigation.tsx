import React from 'react';
import { Tooltip } from '@arco-design/web-react';
import type { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
// import './DirectoryTree.scss';

export interface FolderInfo {
  id: string;
  name: string;
}

export interface MultiLevelPathNavigationProps {
  folderStack: FolderInfo[];
  currentFolderName: string;
  onFolderClick?: (
    folderId: string
  ) => Promise<TreeDataType[]> | TreeDataType[];
  onNavigateToFolder: (
    folderId: string,
    folderName: string,
    newStack: FolderInfo[]
  ) => void;
}

const MultiLevelPathNavigation: React.FC<MultiLevelPathNavigationProps> = ({
  folderStack,
  currentFolderName,
  onFolderClick,
  onNavigateToFolder
}) => {
  if (folderStack.length === 0) {
    return null;
  }

  const handleFolderClick = (folder: FolderInfo, index: number) => {
    try {
      // 截取到当前点击的文件夹为止的路径（包含当前点击的文件夹）
      const newStack = folderStack.slice(0, index);

      // 通知父组件导航到指定文件夹
      onNavigateToFolder(folder.id, folder.name, newStack);
    } catch (error) {
      console.error('Failed to navigate to folder:', error);
    }
  };

  return (
    <div className="directory-path-navigation flex items-center">
      {/* 显示 .../当前目录名，hover 时显示完整路径 */}
      <Tooltip
        content={
          <div className="path-tooltip">
            {/* 渲染文件夹栈中的每个文件夹 */}
            {folderStack.map((folder, index) => (
              <span key={folder.id}>
                <span
                  className="tooltip-folder-item cursor-pointer hover:text-[#007DFA]"
                  onClick={() => handleFolderClick(folder, index)}
                >
                  {folder.name}
                </span>
                {index !== folderStack.length - 1 && (
                  <span className="tooltip-separator">/</span>
                )}
              </span>
            ))}
          </div>
        }
        position="top"
      >
        <span className="path-separator mr-1 hover:text-[#007DFA]">...</span>
      </Tooltip>
      <span className="path-separator mr-1">/</span>
      <span className="current-folder text-[14px] font-[500] text-[#334155]">
        {currentFolderName}
      </span>
    </div>
  );
};

export default MultiLevelPathNavigation;
