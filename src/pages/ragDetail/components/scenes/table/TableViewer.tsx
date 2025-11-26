/**
 * Table Viewer Component
 * 表格查看器
 */

import React, { useState, useEffect } from 'react';
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

        if (jsonData.length === 0) {
          return {
            id: `sheet-${index}`,
            content: sheetName,
            charCount: 0,
            segmentIndex: index,
            tableData: {
              headers: [],
              rows: []
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

        return {
          id: `sheet-${index}`,
          content: sheetName,
          charCount: JSON.stringify(jsonData).length,
          segmentIndex: index,
          tableData: {
            headers,
            rows
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
    const contentStr = String(content);
    if (containsMarkdown(contentStr)) {
      return (
        <div className="text-gray-900">
          <SegmentMarkdown content={contentStr} className="!m-0 !p-0" />
        </div>
      );
    }
    return <span className="text-gray-900">{contentStr}</span>;
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 表格显示区域 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white">
          {/* 表格标题 */}
          {/* 表格内容 */}
          <div className="overflow-x-auto">
            <table
              className={`border-collapse border ${
                tableData.headers.length >= 4 ? '' : 'w-full'
              }`}
              style={
                tableData.headers.length >= 4
                  ? {
                      tableLayout: 'fixed',
                      width: `${tableData.headers.length * 200}px`
                    }
                  : { tableLayout: 'fixed', width: '100%' }
              }
            >
              {/* 表头 */}
              {tableData?.headers && tableData.headers.length > 0 && (
                <thead>
                  <tr className="bg-white">
                    {tableData.headers.map((header, index) => (
                      <th
                        key={index}
                        className="h-10 border-b px-4 text-left text-sm font-semibold text-gray-900"
                        style={
                          tableData.headers.length >= 4
                            ? { width: '200px', minWidth: '200px' }
                            : { width: `${100 / tableData.headers.length}%` }
                        }
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              {/* 数据行 */}
              <tbody>
                {tableData?.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="bg-white transition-colors">
                    {tableData?.headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="h-10 border-b px-4 text-sm"
                        style={
                          tableData.headers.length >= 4
                            ? { width: '200px', minWidth: '200px' }
                            : { width: `${100 / tableData.headers.length}%` }
                        }
                      >
                        {renderCellContent(row[header])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableViewer;
