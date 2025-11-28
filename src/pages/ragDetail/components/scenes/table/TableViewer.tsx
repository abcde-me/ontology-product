/**
 * Table Viewer Component
 * 表格查看器
 */

import React, { useState, useEffect, useRef } from 'react';
import { TableSegment } from '../../../types';
import { useRagDetailStore } from '../../../store/ragDetailStore';
import { parseExcelFromBinary } from './utils/excelParser';
import { useTableScroll } from './hooks/useTableScroll';
import TableHeader from './components/TableHeader';
import TableBody from './components/TableBody';
import TableNavigator from './components/TableNavigator';
import {
  LoadingState,
  ErrorState,
  EmptyState
} from './components/LoadingStates';

interface TableViewerProps {
  segments?: TableSegment[];
  excelUrl?: string;
}

const TableViewer: React.FC<TableViewerProps> = ({}) => {
  const { fileBinaryData, fileBinaryDataLoading, fileBinaryDataError } =
    useRagDetailStore();
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [excelSheets, setExcelSheets] = useState<TableSegment[]>([]);

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // 使用Excel数据
  const displaySegments = excelSheets;
  const currentSegment = displaySegments[currentTableIndex];
  const tableData = currentSegment?.tableData;

  // 使用滚动 Hook
  const { needsHorizontalScroll, tableWidth } = useTableScroll({
    tableScrollRef,
    tableRef,
    horizontalScrollRef,
    tableData
  });

  // 从URL加载Excel文件
  useEffect(() => {
    if (fileBinaryData) {
      const sheets = parseExcelFromBinary(fileBinaryData);
      setExcelSheets(sheets);
      setCurrentTableIndex(0);
    }
  }, [fileBinaryData]);

  // 导航处理
  const handlePrevious = () => {
    setCurrentTableIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentTableIndex((prev) =>
      Math.min(displaySegments.length - 1, prev + 1)
    );
  };

  // 加载状态
  if (fileBinaryDataLoading) {
    return <LoadingState />;
  }

  // 错误状态
  if (fileBinaryDataError) {
    return <ErrorState />;
  }

  // 空数据状态
  if (displaySegments.length === 0 || !tableData) {
    return <EmptyState />;
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 表格显示区域 */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          ref={tableScrollRef}
        >
          <table
            ref={tableRef}
            className={`border-collapse ${
              tableData.headers.length >= 4 ? '' : 'w-full'
            }`}
            style={
              tableData.headers.length >= 4
                ? {
                    tableLayout: 'fixed',
                    width: `${tableData.headers.length * 200}px`
                  }
                : {
                    tableLayout: 'fixed',
                    width: '100%'
                  }
            }
          >
            {/* 表头 */}
            {tableData?.headerRows && tableData.headerRows.length > 0 && (
              <TableHeader
                headerRows={tableData.headerRows}
                headers={tableData.headers}
                merges={tableData.merges}
              />
            )}

            {/* 数据行 */}
            {tableData?.rows && (
              <TableBody
                rows={tableData.rows}
                headers={tableData.headers}
                headerRowCount={tableData.headerRows?.length || 0}
                merges={tableData.merges}
              />
            )}
          </table>
        </div>

        {/* 固定在底部的横向滚动条 - 仅在需要横向滚动时显示 */}
        {needsHorizontalScroll && (
          <div
            ref={horizontalScrollRef}
            className="overflow-x-scroll border-t bg-white"
            style={{
              height: '17px',
              flexShrink: 0
            }}
          >
            <div
              style={{
                height: '1px',
                width: tableWidth > 0 ? `${tableWidth}px` : '100%'
              }}
            />
          </div>
        )}

        {/* 表格导航 */}
        <TableNavigator
          currentIndex={currentTableIndex}
          total={displaySegments.length}
          currentName={currentSegment.content}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  );
};

export default TableViewer;
