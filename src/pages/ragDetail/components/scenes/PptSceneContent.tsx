/**
 * PPT Scene Content Component
 * PPT展示场景：PPT查看器 + 分段列表
 */

import React, { useMemo } from 'react';
import { useRagDetailStore } from '../../store/ragDetailStore';
import PptViewer from '../PptViewer';
import PptSegmentList from '../PptSegmentList';
import ContentHeader from '../ContentHeader';

interface PptSceneContentProps {
  loading: boolean;
}

const PptSceneContent: React.FC<PptSceneContentProps> = ({ loading }) => {
  const { segments, fileName, showPdfViewer } = useRagDetailStore();

  const pptSegments = useMemo(() => {
    return segments as any[];
  }, [segments]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* 顶部：文件名和操作按钮 */}
      <ContentHeader fileName={fileName} />

      {/* 下方：内容区域 */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* PPT查看器 */}
        {showPdfViewer && (
          <div className="flex-1 overflow-hidden rounded-[20px] bg-gray-50">
            <PptViewer segments={pptSegments} />
          </div>
        )}

        {/* 分段列表 */}
        <div className="flex-1 overflow-hidden rounded-[20px] bg-gray-50">
          <PptSegmentList segments={pptSegments} />
        </div>
      </div>
    </div>
  );
};

export default PptSceneContent;
