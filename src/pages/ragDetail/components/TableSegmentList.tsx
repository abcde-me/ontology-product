/**
 * Table Segment List Component
 * 表格分段列表
 */

import React, { useMemo } from 'react';
import { TableSegment } from '../types';
import { useRagDetailStore } from '../store/ragDetailStore';
import TableSegmentCard from './TableSegmentCard';

interface TableSegmentListProps {
  segments: TableSegment[];
  showTableViewer?: boolean;
  onToggleTableViewer?: () => void;
}

const TableSegmentList: React.FC<TableSegmentListProps> = ({
  segments,
  showTableViewer = true,
  onToggleTableViewer
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
            表格数:{' '}
            <span className="font-medium text-gray-900">{segments.length}</span>
          </div>
        </div>
        {onToggleTableViewer && (
          <button
            onClick={onToggleTableViewer}
            className="rounded px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            {showTableViewer ? '隐藏表格' : '显示表格'}
          </button>
        )}
      </div>

      {/* 分段列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {memoizedSegments.length > 0 ? (
          <div className="space-y-3">
            {memoizedSegments.map((segment) => (
              <TableSegmentCard
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

export default TableSegmentList;
