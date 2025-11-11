/**
 * PPT Scene Content Component
 * PPT展示场景：PPT查看器 + 目录树（可选）+ 分段列表
 * 布局参考PdfSceneContent，保持一致的用户体验
 */

import React, { useMemo } from 'react';
import { useRagDetailStore } from '../../../store/ragDetailStore';
import PptViewer from './PptViewer';
import SegmentList from '../../shared/SegmentList';
import DirectoryTree from '../../shared/DirectoryTree';
import ContentHeader from '../../common/ContentHeader';

interface PptSceneContentProps {
  loading: boolean;
}

const PptSceneContent: React.FC<PptSceneContentProps> = ({ loading }) => {
  const { segments, fileName, filePath, showPdfViewer, directory } =
    useRagDetailStore();

  const pptSegments = useMemo(() => {
    return segments as any[];
  }, [segments]);

  // 判断是否有目录树数据
  const hasDirectory = directory && directory.length > 0;

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
      <ContentHeader fileName={fileName} />

      {/* 下方：内容区域 */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* PPT查看器 - 使用CSS控制显示/隐藏 */}
        <div
          className={`h-full flex-1 overflow-hidden bg-gray-50 ${!hasDirectory ? 'ml-4 rounded-bl-[20px]' : 'ml-4'} ${!showPdfViewer ? 'hidden' : ''}`}
          style={{ minHeight: 0 }}
        >
          <PptViewer fileName={fileName} filePath={filePath} hideHeader />
        </div>

        {/* PPT和右侧内容之间的分隔线 */}
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
            segments={pptSegments}
            renderMode="text"
            hideHeader={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PptSceneContent;
