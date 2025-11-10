/**
 * Image-Text Segment List Component
 * 显示包含图片的分段列表
 */

import React, { useMemo } from 'react';
import { ImageTextSegment } from '../types';
import { useRagDetailStore } from '../store/ragDetailStore';
import ImageTextSegmentCard from './ImageTextSegmentCard';
import SegmentListHeader from './SegmentListHeader';

interface ImageTextSegmentListProps {
  segments: ImageTextSegment[];
}

const ImageTextSegmentList: React.FC<ImageTextSegmentListProps> = ({
  segments
}) => {
  const { selectedSegmentId, togglePdfViewer, showPdfViewer } =
    useRagDetailStore();

  const memoizedSegments = useMemo(() => {
    return segments;
  }, [segments]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 列表头部 */}
      <SegmentListHeader
        segments={segments}
        showPdfViewer={showPdfViewer}
        onTogglePdfViewer={togglePdfViewer}
      />

      {/* 分段列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {memoizedSegments.length > 0 ? (
          <div className="space-y-3">
            {memoizedSegments.map((segment) => (
              <ImageTextSegmentCard
                key={segment.id}
                segment={segment}
                isSelected={selectedSegmentId === segment.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            暂无分段数据
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageTextSegmentList;
