import React, { useState } from 'react';
import { useRagDetailStore } from '../store/ragDetailStore';
import SegmentList from './SegmentList';
import DirectoryTree from './DirectoryTree';
import PdfViewer from './PdfViewer';
import ContentHeader from './ContentHeader';

interface PdfSceneContentProps {
  showPdfViewer: boolean;
  loading: boolean;
}

/**
 * PDF场景内容组件
 * 根据数据自动判断渲染模式：
 * - 如果有directory数据 -> 渲染目录树 + 分段列表（层级结构）
 * - 如果segments包含images -> 渲染图文混合模式
 * - 否则 -> 渲染普通文本分段模式
 */
const PdfSceneContent: React.FC<PdfSceneContentProps> = ({
  showPdfViewer,
  loading
}) => {
  const { segments, directory, fileName, filePath } = useRagDetailStore();
  const [useMockBinaryData, setUseMockBinaryData] = useState(false);

  // 判断是否有目录树数据
  const hasDirectory = directory && directory.length > 0;

  // 判断是否是图文混合模式（检查segments中是否有images字段）
  const hasImages = segments.some(
    (seg: any) => seg.images && seg.images.length > 0
  );

  const handleToggleMockBinaryData = (checked: boolean) => {
    setUseMockBinaryData(checked);
    console.log('Toggle mock binary data:', checked);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={{ minHeight: 0 }}>
      {/* 顶部：文件名和操作按钮 */}
      <ContentHeader
        fileName={fileName}
        useMockBinaryData={useMockBinaryData}
        onToggleMockBinaryData={handleToggleMockBinaryData}
      />

      {/* 下方：内容区域 */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* PDF查看器 - 使用CSS控制显示/隐藏，避免重新加载 */}
        <div
          className={`h-full flex-1 overflow-hidden bg-gray-50 ${!hasDirectory ? 'ml-4 rounded-bl-[20px]' : 'ml-4'} ${!showPdfViewer ? 'hidden' : ''}`}
          style={{ minHeight: 0 }}
        >
          <PdfViewer
            fileName={fileName}
            filePath={filePath}
            hideHeader
            useMockBinaryData={useMockBinaryData}
          />
        </div>
        {/* PDF和右侧内容之间的分隔线 */}
        {showPdfViewer && <div className="w-[1px] flex-shrink-0 bg-gray-200" />}

        {/* 目录树（如果有） */}
        {hasDirectory && directory && (
          <>
            <div
              className={`h-full w-[240px] flex-shrink-0 overflow-hidden bg-gray-50 ${!showPdfViewer ? 'ml-4 rounded-bl-[20px]' : ''}`}
              style={{ minHeight: 0 }}
            >
              <DirectoryTree nodes={directory} />
            </div>
            {/* 目录树和分段列表之间的分隔线 */}
            <div className="w-[1px] flex-shrink-0 bg-gray-200" />
          </>
        )}

        {/* 分段列表 */}
        <div
          className={`h-full flex-1 overflow-hidden rounded-br-[20px] bg-white ${!showPdfViewer && !hasDirectory ? 'ml-4 rounded-bl-[20px]' : ''}`}
          style={{ minHeight: 0 }}
        >
          <SegmentList
            segments={segments}
            renderMode={hasImages ? 'image-text' : 'text'}
            hideHeader={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfSceneContent;
