/**
 * PPT Segment List Component
 * PPT分段列表
 */

import React, { useMemo } from 'react';
import { PptSegment } from '../types';
import { useRagDetailStore } from '../store/ragDetailStore';
import PptSegmentCard from './PptSegmentCard';

interface PptSegmentListProps {
  segments: PptSegment[];
  showPptViewer?: boolean;
  onTogglePptViewer?: () => void;
}

const PptSegmentList: React.FC<PptSegmentListProps> = ({
  segments,
  showPptViewer = true,
  onTogglePptViewer
}) => {
  const { selectedSegmentId } = useRagDetailStore();

  const memoizedSegments = useMemo(() => {
    return segments;
  }, [segments]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 列表头部 */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-gray-50 px-4">
        <div className="flex items-center gap-6">
          <div className="text-sm text-gray-600">
            幻灯片数:{' '}
            <span className="font-medium text-gray-900">{segments.length}</span>
          </div>
        </div>
        {onTogglePptViewer && (
          <button
            onClick={onTogglePptViewer}
            className="rounded px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            {showPptViewer ? '隐藏PPT' : '显示PPT'}
          </button>
        )}
      </div>

      {/* 分段列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {memoizedSegments.length > 0 ? (
          <div className="space-y-3">
            {memoizedSegments.map((segment) => (
              <PptSegmentCard
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

export default PptSegmentList;
