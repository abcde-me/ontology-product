/**
 * Table Segment Card Component
 * 表格分段卡片
 */

import React, { useState } from 'react';
import { TableSegment } from '../types';
import { useRagDetailStore } from '../store/ragDetailStore';

interface TableSegmentCardProps {
  segment: TableSegment;
  isSelected: boolean;
}

const TableSegmentCard: React.FC<TableSegmentCardProps> = ({
  segment,
  isSelected
}) => {
  const { selectSegment } = useRagDetailStore();
  const [isHovered, setIsHovered] = useState(false);

  const tableData = segment.tableData;

  return (
    <div
      className={`
        cursor-pointer rounded-lg border-2 transition-all duration-200
        ${
          isSelected
            ? 'border-[#007DFA] bg-blue-50'
            : isHovered
              ? 'border-[#007DFA] bg-white'
              : 'border-gray-200 bg-white'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => selectSegment(segment.id)}
    >
      {/* 卡片头部 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">
            {segment.content}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {tableData?.rows.length || 0} 行
        </span>
      </div>

      {/* 表格预览 */}
      {tableData && (
        <div className="max-h-[300px] overflow-x-auto p-3">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {tableData.headers.map((header, index) => (
                  <th
                    key={index}
                    className="whitespace-nowrap border-r border-gray-200 px-2 py-1 text-left font-semibold text-gray-900 last:border-r-0"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.slice(0, 3).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-200 ${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {tableData.headers.map((header, colIndex) => (
                    <td
                      key={colIndex}
                      className="truncate border-r border-gray-200 px-2 py-1 text-gray-700 last:border-r-0"
                    >
                      {row[header] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {tableData.rows.length > 3 && (
            <div className="mt-2 text-center text-xs text-gray-500">
              ... 还有 {tableData.rows.length - 3} 行
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableSegmentCard;
