/**
 * Table Segment List Component
 * 表格分段列表
 */

import React, { useMemo } from 'react';
import { useRagDetailStore } from '../../../store/ragDetailStore';
import { TableSegment } from '../../../types';
import SegmentListHeader from '../../shared/SegmentListHeader';
import TableSegmentCard from './TableSegmentCard';
interface TableSegmentListProps {
  segments: TableSegment[];
}

const TableSegmentList: React.FC<TableSegmentListProps> = ({
  segments: propSegments
}) => {
  const {
    selectedSegmentId,
    segments: storeSegments,
    segmentSearchText
  } = useRagDetailStore();

  // 优先使用props，如果没有则使用store中的数据
  const segments = propSegments || storeSegments;

  // 搜索过滤逻辑
  const filteredSegments = useMemo(() => {
    if (!segmentSearchText.trim()) {
      return segments;
    }

    const searchLower = segmentSearchText.toLowerCase().trim();
    return segments.filter((segment) => {
      const contentMatch = segment.content.toLowerCase().includes(searchLower);
      return contentMatch;
    });
  }, [segments, segmentSearchText]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 列表头部 */}
      <SegmentListHeader
        totalCount={segments.length}
        filteredCount={filteredSegments.length}
      />

      {/* 分段列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredSegments.length > 0 ? (
          <div className="space-y-3">
            {filteredSegments.map((segment) => (
              <TableSegmentCard
                key={segment.id}
                segment={segment}
                isSelected={selectedSegmentId === segment.id}
                totalSegments={segments.length}
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

export default TableSegmentList;
