import React, { useState } from 'react';
import { Button, Switch } from '@arco-design/web-react';
import { IconEye, IconEyeInvisible } from '@arco-design/web-react/icon';
import { useRagDetailStore } from '../../store/ragDetailStore';

interface ContentHeaderProps {
  fileName: string;
  showFileViewer?: boolean;
  onToggleFileViewer?: () => void;
  useMockBinaryData?: boolean;
  onToggleMockBinaryData?: (checked: boolean) => void;
}

/**
 * 内容头部组件
 * 显示文件名和显示/隐藏原文件按钮
 * 适用于PDF、PPT、Excel等场景
 */
const ContentHeader: React.FC<ContentHeaderProps> = ({
  fileName,
  showFileViewer,
  onToggleFileViewer,
  useMockBinaryData = false,
  onToggleMockBinaryData
}) => {
  const { showPdfViewer, togglePdfViewer } = useRagDetailStore();
  const [localUseMockBinaryData, setLocalUseMockBinaryData] =
    useState(useMockBinaryData);

  // 优先使用props，如果没有则使用store中的数据
  const isFileViewerVisible =
    showFileViewer !== undefined ? showFileViewer : showPdfViewer;
  const handleToggle = onToggleFileViewer || togglePdfViewer;

  const handleMockBinaryDataToggle = (checked: boolean) => {
    setLocalUseMockBinaryData(checked);
    if (onToggleMockBinaryData) {
      onToggleMockBinaryData(checked);
    }
  };

  return (
    <div className="flex h-[56px] flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
      <span className="text-[14px] font-medium text-gray-900">{fileName}</span>
      <div className="flex items-center gap-4">
        {/* Mock二进制数据开关 */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray-600">使用Mock二进制数据:</span>
          <Switch
            checked={localUseMockBinaryData}
            onChange={handleMockBinaryDataToggle}
            size="small"
          />
        </div>
        {/* 显示/隐藏原文件按钮 */}
        <Button
          type="text"
          icon={isFileViewerVisible ? <IconEyeInvisible /> : <IconEye />}
          onClick={handleToggle}
          size="small"
        >
          {isFileViewerVisible ? '隐藏原文件' : '显示原文件'}
        </Button>
      </div>
    </div>
  );
};

export default ContentHeader;
