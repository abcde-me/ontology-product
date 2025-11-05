/**
 * Table Scene Content Component
 * 表格分段场景：左侧表格 + 右侧分段表格
 */

import React, { useMemo } from 'react';
import { useRagDetailStore } from '../../store/ragDetailStore';
import TableViewer from '../TableViewer';
import TableSegmentList from '../TableSegmentList';
import ContentHeader from '../ContentHeader';

interface TableSceneContentProps {
  loading: boolean;
}

const TableSceneContent: React.FC<TableSceneContentProps> = ({ loading }) => {
  const { segments, fileName, showPdfViewer } = useRagDetailStore();

  const tableSegments = useMemo(() => {
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
        {/* 表格查看器 */}
        {showPdfViewer && (
          <div className="flex-1 overflow-hidden rounded-[20px] bg-gray-50">
            <TableViewer segments={tableSegments} />
          </div>
        )}

        {/* 分段列表 */}
        <div className="flex-1 overflow-hidden rounded-[20px] bg-gray-50">
          <TableSegmentList segments={tableSegments} />
        </div>
      </div>
    </div>
  );
};

export default TableSceneContent;
