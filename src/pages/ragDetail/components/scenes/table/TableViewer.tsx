/**
 * Table Viewer Component
 * 表格查看器
 */

import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { TableSegment } from '../../../types';
import { useRagDetailStore } from '../../../store/ragDetailStore';
import SegmentMarkdown from '../../common/SegmentMarkdown';
import { containsMarkdown } from '../../../utils/excelUtils';
interface TableViewerProps {
  segments?: TableSegment[];
  excelUrl?: string; // 新增：Excel文件URL
}

const TableViewer: React.FC<TableViewerProps> = ({}) => {
  const { fileBinaryData, fileBinaryDataLoading, fileBinaryDataError } =
    useRagDetailStore();
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [excelSheets, setExcelSheets] = useState<TableSegment[]>([]);
  const [needsHorizontalScroll, setNeedsHorizontalScroll] = useState(false);
  const [tableWidth, setTableWidth] = useState<number>(0);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  // 从URL加载Excel文件
  useEffect(() => {
    if (fileBinaryData) {
      loadExcelFromUrl();
    }
  }, [fileBinaryData]);

  const loadExcelFromUrl = () => {
    const workbook = XLSX.read(fileBinaryData, { type: 'array' });
    // 将每个工作表转换为TableSegment格式
    const sheets: TableSegment[] = workbook.SheetNames.map(
      (sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName];

        // 将工作表转换为JSON数组，保留所有数据（包括空白行和空白单元格）
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: true
        });

        // 获取合并单元格信息
        const merges = worksheet['!merges'] || [];

        if (jsonData.length === 0) {
          return {
            id: `sheet-${index}`,
            content: sheetName,
            charCount: 0,
            segmentIndex: index,
            tableData: {
              headers: [],
              rows: [],
              merges: []
            }
          };
        }

        // 计算最大列数
        const maxCols = Math.max(...jsonData.map((row) => row.length), 0);

        // 第一行作为表头，如果第一行存在
        const hasHeader = jsonData.length > 0;
        const headerRow = hasHeader ? jsonData[0] : [];
        const headers = Array.from({ length: maxCols }, (_, idx) => {
          const cellValue = headerRow[idx];
          return cellValue != null ? String(cellValue) : '';
        });

        // 剩余行作为数据行（如果第一行是表头，则从第二行开始）
        const dataRows = hasHeader ? jsonData.slice(1) : jsonData;
        const rows = dataRows.map((row) => {
          const rowObj: Record<string, string> = {};
          headers.forEach((header, idx) => {
            const cellValue = row[idx];
            rowObj[header || idx.toString()] =
              cellValue != null ? String(cellValue) : '';
          });
          return rowObj;
        });

        let charCount = 0;
        try {
          charCount = JSON.stringify(jsonData).length;
        } catch (error) {
          console.error('计算字符数失败:', error);
        }

        return {
          id: `sheet-${index}`,
          content: sheetName,
          charCount,
          segmentIndex: index,
          tableData: {
            headers,
            rows,
            merges: merges.map((merge) => ({
              startRow: merge.s.r,
              endRow: merge.e.r,
              startCol: merge.s.c,
              endCol: merge.e.c
            }))
          }
        };
      }
    );

    setExcelSheets(sheets);
    setCurrentTableIndex(0);
  };

  // 使用Excel数据或segments数据
  const displaySegments = excelSheets;
  const currentSegment = displaySegments[currentTableIndex];
  const tableData = currentSegment?.tableData;

  // 检测是否需要横向滚动
  useEffect(() => {
    const checkScrollNeeded = () => {
      const tableScroll = tableScrollRef.current;
      const table = tableRef.current;

      if (!tableScroll || !table) {
        setNeedsHorizontalScroll(false);
        setTableWidth(0);
        return;
      }

      // 检测表格实际宽度是否超过容器宽度
      const currentTableWidth = table.scrollWidth;
      const containerWidth = tableScroll.clientWidth;
      setTableWidth(currentTableWidth);
      setNeedsHorizontalScroll(currentTableWidth > containerWidth);
    };

    // 初始检测
    checkScrollNeeded();

    // 监听窗口大小变化和表格大小变化
    const resizeObserver = new ResizeObserver(checkScrollNeeded);
    if (tableScrollRef.current) {
      resizeObserver.observe(tableScrollRef.current);
    }
    if (tableRef.current) {
      resizeObserver.observe(tableRef.current);
    }

    // 延迟检测，确保表格已渲染
    const timeoutId = setTimeout(checkScrollNeeded, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [tableData]);

  // 同步横向滚动
  useEffect(() => {
    const tableScroll = tableScrollRef.current;
    const horizontalScroll = horizontalScrollRef.current;

    if (!tableScroll || !horizontalScroll || !needsHorizontalScroll) return;

    const handleScroll = () => {
      horizontalScroll.scrollLeft = tableScroll.scrollLeft;
    };

    tableScroll.addEventListener('scroll', handleScroll);
    horizontalScroll.addEventListener('scroll', () => {
      tableScroll.scrollLeft = horizontalScroll.scrollLeft;
    });

    return () => {
      tableScroll.removeEventListener('scroll', handleScroll);
    };
  }, [tableData, needsHorizontalScroll]);

  if (fileBinaryDataLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-2 text-gray-600">正在加载Excel文件...</div>
          <div className="text-sm text-gray-500">请稍候</div>
        </div>
      </div>
    );
  }

  if (fileBinaryDataError) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-2 text-red-600">加载失败</div>
        </div>
      </div>
    );
  }

  if (displaySegments.length === 0 || !tableData) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-gray-500">暂无表格数据</div>
      </div>
    );
  }

  // 渲染单元格内容
  const renderCellContent = (content: string | number) => {
    const contentStr = String(content || '');
    // if (containsMarkdown(contentStr)) {
    //   return (
    //     <div className="text-gray-900">
    //       <SegmentMarkdown content={contentStr} className="!m-0 !p-0" />
    //     </div>
    //   );
    // }
    return <span className="break-all text-gray-900">{contentStr}</span>;
  };

  // 获取单元格的合并信息
  const getCellMergeInfo = (rowIndex: number, colIndex: number) => {
    if (!tableData?.merges) return null;

    // rowIndex是数据行索引（0-based），需要加1因为有表头
    const actualRowIndex = rowIndex + 1;

    for (const merge of tableData.merges) {
      // 检查当前单元格是否是合并区域的起始单元格
      if (merge.startRow === actualRowIndex && merge.startCol === colIndex) {
        return {
          rowSpan: merge.endRow - merge.startRow + 1,
          colSpan: merge.endCol - merge.startCol + 1,
          isStart: true
        };
      }
      // 检查当前单元格是否在合并区域内（但不是起始单元格）
      if (
        actualRowIndex >= merge.startRow &&
        actualRowIndex <= merge.endRow &&
        colIndex >= merge.startCol &&
        colIndex <= merge.endCol
      ) {
        return {
          rowSpan: 1,
          colSpan: 1,
          isStart: false
        };
      }
    }
    return null;
  };

  // 检查表头单元格是否应该渲染
  const shouldRenderHeaderCell = (colIndex: number) => {
    if (!tableData?.merges) return true;

    for (const merge of tableData.merges) {
      // 检查是否在表头行的合并区域内（但不是起始单元格）
      if (
        merge.startRow === 0 &&
        colIndex >= merge.startCol &&
        colIndex <= merge.endCol &&
        colIndex !== merge.startCol
      ) {
        return false;
      }
    }
    return true;
  };

  // 获取表头单元格的合并信息
  const getHeaderCellMergeInfo = (colIndex: number) => {
    if (!tableData?.merges) return null;

    for (const merge of tableData.merges) {
      if (merge.startRow === 0 && merge.startCol === colIndex) {
        return {
          colSpan: merge.endCol - merge.startCol + 1,
          rowSpan: merge.endRow - merge.startRow + 1
        };
      }
    }
    return null;
  };

  const handlePrevious = () => {
    setCurrentTableIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentTableIndex((prev) =>
      Math.min(displaySegments.length - 1, prev + 1)
    );
  };

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
            {tableData?.headers && tableData.headers.length > 0 && (
              <thead>
                <tr className="bg-white">
                  {tableData.headers.map((header, index) => {
                    if (!shouldRenderHeaderCell(index)) {
                      return null;
                    }
                    const mergeInfo = getHeaderCellMergeInfo(index);
                    return (
                      <th
                        key={index}
                        className="h-10 px-4 text-left text-sm font-semibold text-gray-900"
                        style={{
                          ...(tableData.headers.length >= 4
                            ? { width: '200px', minWidth: '200px' }
                            : { width: `${100 / tableData.headers.length}%` }),
                          borderTop: '1px solid #e5e7eb',
                          borderBottom: '1px solid #e5e7eb',
                          verticalAlign: 'middle'
                        }}
                        colSpan={mergeInfo?.colSpan || 1}
                        rowSpan={mergeInfo?.rowSpan || 1}
                      >
                        {header}
                      </th>
                    );
                  })}
                </tr>
              </thead>
            )}
            {/* 数据行 */}
            <tbody>
              {tableData?.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="bg-white transition-colors">
                  {tableData?.headers.map((header, colIndex) => {
                    const mergeInfo = getCellMergeInfo(rowIndex, colIndex);

                    // 如果单元格在合并区域内但不是起始单元格，则不渲染
                    if (mergeInfo && !mergeInfo.isStart) {
                      return null;
                    }

                    return (
                      <td
                        key={colIndex}
                        className="h-10 px-4 text-sm"
                        style={{
                          ...(tableData.headers.length >= 4
                            ? { width: '200px', minWidth: '200px' }
                            : { width: `${100 / tableData.headers.length}%` }),
                          borderBottom: '1px solid #e5e7eb',
                          verticalAlign: 'middle'
                        }}
                        rowSpan={mergeInfo?.rowSpan || 1}
                        colSpan={mergeInfo?.colSpan || 1}
                      >
                        {renderCellContent(row[header])}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
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
        {displaySegments.length > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
            <button
              onClick={handlePrevious}
              disabled={currentTableIndex === 0}
              className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← 上一个
            </button>

            <div className="text-sm text-gray-600">
              {currentSegment.content}
            </div>

            <button
              onClick={handleNext}
              disabled={currentTableIndex === displaySegments.length - 1}
              className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一个 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableViewer;
