/**
 * Table Viewer Component
 * 表格查看器
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { TableSegment } from '../../../types';

interface TableViewerProps {
  segments?: TableSegment[];
  excelUrl?: string; // 新增：Excel文件URL
}

const TableViewer: React.FC<TableViewerProps> = ({
  segments = []
  // excelUrl
}) => {
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excelSheets, setExcelSheets] = useState<TableSegment[]>([]);
  const excelUrl =
    'http://10.252.216.16:30895/metadata-service/api/v1/file/downloadFile?bucket=datasource-dev&path=/10/10/orginal/111.xlsx';
  // 从URL加载Excel文件
  useEffect(() => {
    if (excelUrl) {
      loadExcelFromUrl(excelUrl);
    }
  }, [excelUrl]);

  const loadExcelFromUrl = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      // 下载Excel文件
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }

      // 获取ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();

      // 使用xlsx解析
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // 将每个工作表转换为TableSegment格式
      const sheets: TableSegment[] = workbook.SheetNames.map(
        (sheetName, index) => {
          const worksheet = workbook.Sheets[sheetName];

          // 将工作表转换为JSON数组，保留所有数据
          const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            blankrows: false
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
    } catch (err) {
      console.error('加载Excel文件失败:', err);
      setError(err instanceof Error ? err.message : '加载Excel文件失败');
    } finally {
      setLoading(false);
    }
  };

  // 使用Excel数据或segments数据
  const displaySegments = excelSheets;
  const currentSegment = displaySegments[currentTableIndex];
  const tableData = currentSegment?.tableData;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-2 text-gray-600">正在加载Excel文件...</div>
          <div className="text-sm text-gray-500">请稍候</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-2 text-red-600">加载失败</div>
          <div className="text-sm text-gray-500">{error}</div>
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
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white">
          {/* 表格标题 */}
          {/* <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {currentSegment.content}
            </h3>
          </div> */}

          {/* 表格内容 */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              {/* 表头 */}
              {tableData?.headers && tableData.headers.length > 0 && (
                <thead>
                  <tr className="bg-white">
                    {tableData.headers.map((header, index) => (
                      <th
                        key={index}
                        className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-900"
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
                        className="border-b px-4 py-3 text-sm text-gray-700"
                      >
                        {row[header || colIndex.toString()] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 控制条 */}
      {/* <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
        <button
          onClick={handlePrevious}
          disabled={currentTableIndex === 0}
          className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← 上一个
        </button>

        <div className="text-sm text-gray-600">
          {excelUrl ? '工作表' : '表格'} {currentTableIndex + 1} /{' '}
          {displaySegments.length}
        </div>

        <button
          onClick={handleNext}
          disabled={currentTableIndex === displaySegments.length - 1}
          className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          下一个 →
        </button>
      </div> */}
    </div>
  );
};

export default TableViewer;
