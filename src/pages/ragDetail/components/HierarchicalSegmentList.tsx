/**
 * Hierarchical Segment List Component
 * 显示分层级的分段列表
 */

import React, { useMemo } from 'react';
import { HierarchicalSegment } from '../types';
import { useRagDetailStore } from '../store/ragDetailStore';
import SegmentCard from './SegmentCard';

interface HierarchicalSegmentListProps {
  segments: HierarchicalSegment[];
}

const HierarchicalSegmentList: React.FC<HierarchicalSegmentListProps> = ({
  segments
}) => {
  const { selectedSegmentId } = useRagDetailStore();

  const memoizedSegments = useMemo(() => {
    return segments;
  }, [segments]);

  const renderSegmentWithIndent = (segment: HierarchicalSegment) => {
    const isSelected = selectedSegmentId === segment.id;
    // 根据level计算左边距
    const paddingLeft = (segment.level - 1) * 20;

    return (
      <div
        key={segment.id}
        style={{ paddingLeft: `${paddingLeft}px` }}
        className="mb-3"
      >
        <SegmentCard segment={segment} isSelected={isSelected} />
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 列表头部 */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-gray-50 px-4">
        <div className="flex items-center gap-6">
          <div className="text-sm text-gray-600">
            字符数:{' '}
            <span className="font-medium text-gray-900">
              {segments.reduce((sum, seg) => sum + seg.charCount, 0)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            分段数:{' '}
            <span className="font-medium text-gray-900">
              {segments.length}/100
            </span>
          </div>
        </div>
      </div>

      {/* 分段列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {memoizedSegments.length > 0 ? (
          <div>
            {memoizedSegments.map((segment) =>
              renderSegmentWithIndent(segment)
            )}
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

export default HierarchicalSegmentList;
