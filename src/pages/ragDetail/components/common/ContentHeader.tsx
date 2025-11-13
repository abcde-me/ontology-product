import React from 'react';
import { IconEye, IconEyeInvisible } from '@arco-design/web-react/icon';
import { useRagDetailStore } from '../../store/ragDetailStore';

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
      {/* 显示/隐藏原文件按钮 */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-md border px-2 py-1 text-sm font-medium transition-colors hover:bg-gray-50"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#CBD5E1',
          color: '#1F2937'
        }}
      >
        {isFileViewerVisible ? <IconEyeInvisible /> : <IconEye />}
        <span>{isFileViewerVisible ? '隐藏原文件' : '显示原文件'}</span>
      </button>
    </div>
  );
};

export default ContentHeader;
