/**
 * Table Viewer Component
 * 表格查看器
 */

import React, { useState } from 'react';
import { TableSegment } from '../../../types';

interface TableViewerProps {
  segments: TableSegment[];
}

const TableViewer: React.FC<TableViewerProps> = ({ segments }) => {
  const [currentTableIndex, setCurrentTableIndex] = useState(0);

  if (segments.length === 0 || !segments[currentTableIndex]?.tableData) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-gray-500">暂无表格数据</div>
      </div>
    );
  }

  const currentSegment = segments[currentTableIndex];
  const tableData = currentSegment.tableData;

  const handlePrevious = () => {
    setCurrentTableIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentTableIndex((prev) => Math.min(segments.length - 1, prev + 1));
  };

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* 表格显示区域 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          {/* 表格标题 */}
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {currentSegment.content}
            </h3>
          </div>

          {/* 表格内容 */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {tableData?.headers.map((header, index) => (
                    <th
                      key={index}
                      className="border-r border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900 last:border-r-0"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData?.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b border-gray-200 ${
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {tableData?.headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="border-r border-gray-200 px-4 py-2 text-sm text-gray-700 last:border-r-0"
                      >
                        {row[header] || '-'}
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
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
        <button
          onClick={handlePrevious}
          disabled={currentTableIndex === 0}
          className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← 上一个
        </button>

        <div className="text-sm text-gray-600">
          第 {currentTableIndex + 1} / {segments.length} 个表格
        </div>

        <button
          onClick={handleNext}
          disabled={currentTableIndex === segments.length - 1}
          className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          下一个 →
        </button>
      </div>
    </div>
  );
};

export default TableViewer;
