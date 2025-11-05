import React from 'react';
import { Button } from '@arco-design/web-react';
import { IconEye, IconEyeInvisible } from '@arco-design/web-react/icon';
import { useRagDetailStore } from '../store/ragDetailStore';

interface ContentHeaderProps {
  fileName: string;
  showFileViewer?: boolean;
  onToggleFileViewer?: () => void;
}

/**
 * 内容头部组件
 * 显示文件名和显示/隐藏原文件按钮
 * 适用于PDF、PPT、Excel等场景
 */
const ContentHeader: React.FC<ContentHeaderProps> = ({
  fileName,
  showFileViewer,
  onToggleFileViewer
}) => {
  const { showPdfViewer, togglePdfViewer } = useRagDetailStore();

  // 优先使用props，如果没有则使用store中的数据
  const isFileViewerVisible =
    showFileViewer !== undefined ? showFileViewer : showPdfViewer;
  const handleToggle = onToggleFileViewer || togglePdfViewer;

  return (
    <div className="flex h-[56px] flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
      <span className="text-[14px] font-medium text-gray-900">{fileName}</span>
      <Button
        type="text"
        icon={isFileViewerVisible ? <IconEyeInvisible /> : <IconEye />}
        onClick={handleToggle}
        size="small"
      >
        {isFileViewerVisible ? '隐藏原文件' : '显示原文件'}
      </Button>
    </div>
  );
};

export default ContentHeader;
