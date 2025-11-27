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
  const {
    fileBinaryData,
    fileBinaryDataLoading,
    fileBinaryDataError,
    highlightedExcelCoordinate,
    clearHighlightedExcelCoordinate
  } = useRagDetailStore();
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [excelSheets, setExcelSheets] = useState<TableSegment[]>([]);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [highlightedRowIndex, setHighlightedRowIndex] = useState<
    number | undefined
  >(undefined);
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
      // 重置行引用数组
      rowRefs.current = [];
    }
  }, [fileBinaryData]);

  // 当表格切换时，重置行引用数组
  useEffect(() => {
    if (tableData?.rows) {
      // 根据当前表格的行数重置引用数组大小
      rowRefs.current = new Array(tableData.rows.length).fill(null);
    }
  }, [currentTableIndex, tableData]);

  // 处理 highlightedExcelCoordinate 定位逻辑：切换到指定表格并高亮指定行
  useEffect(() => {
    // 检查 highlightedExcelCoordinate 是否为空（有 page_id 和 block_index）
    if (
      highlightedExcelCoordinate &&
      highlightedExcelCoordinate.page_id !== undefined &&
      highlightedExcelCoordinate.block_index !== undefined
    ) {
      const targetTableIndex = highlightedExcelCoordinate.page_id - 1; // page_id 是 1-based，转换为 0-based 索引
      const targetRowIndex = highlightedExcelCoordinate.block_index - 1; // block_index 是 1-based，转换为 0-based 索引

      // 检查目标表格索引是否有效
      if (targetTableIndex >= 0 && targetTableIndex < displaySegments.length) {
        // 切换到目标表格
        if (currentTableIndex !== targetTableIndex) {
          setCurrentTableIndex(targetTableIndex);
          // 切换表格时先清除高亮
          setHighlightedRowIndex(undefined);
          return; // 等待表格切换完成，下次 effect 运行时会继续处理
        }

        // 等待表格切换和渲染完成后再滚动和高亮
        // 使用 requestAnimationFrame 和 setTimeout 确保 DOM 已更新
        const scrollAndHighlight = () => {
          const targetSegment = displaySegments[targetTableIndex];
          const targetTableData = targetSegment?.tableData;

          // 检查目标行索引是否有效
          if (
            targetTableData?.rows &&
            targetRowIndex >= 0 &&
            targetRowIndex < targetTableData.rows.length
          ) {
            // 设置高亮行索引
            setHighlightedRowIndex(targetRowIndex);

            // 滚动到目标行
            const targetRow = rowRefs.current[targetRowIndex];
            if (targetRow && tableScrollRef.current) {
              // 检查行是否在可视区域内
              const scrollContainer = tableScrollRef.current;
              const rowRect = targetRow.getBoundingClientRect();
              const containerRect = scrollContainer.getBoundingClientRect();

              // 如果行不在可视区域内，滚动到该位置
              if (
                rowRect.top < containerRect.top ||
                rowRect.bottom > containerRect.bottom
              ) {
                // 计算需要滚动的距离，将行滚动到容器中央
                const scrollTop =
                  scrollContainer.scrollTop +
                  rowRect.top -
                  containerRect.top -
                  containerRect.height / 2 +
                  rowRect.height / 2;

                scrollContainer.scrollTo({
                  top: Math.max(0, scrollTop),
                  behavior: 'smooth'
                });
              }
            } else if (!targetRow) {
              // 如果行引用还没有准备好，再等待一下
              setTimeout(scrollAndHighlight, 50);
            }
          }
        };

        // 使用 requestAnimationFrame 确保 DOM 已更新
        requestAnimationFrame(() => {
          setTimeout(scrollAndHighlight, 50);
        });
      }
    } else {
      // 如果 highlightedExcelCoordinate 为空，清除高亮
      setHighlightedRowIndex(undefined);
    }
  }, [highlightedExcelCoordinate, displaySegments, currentTableIndex]);

  // 导航处理
  const handlePrevious = () => {
    clearHighlightedExcelCoordinate();
    setCurrentTableIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    clearHighlightedExcelCoordinate();
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
                highlightedRowIndex={highlightedRowIndex}
                rowRefs={rowRefs}
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
