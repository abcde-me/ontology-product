/**
 * Table Header Component
 * 表头组件
 */

import React from 'react';
import { CellMerge } from '../../../../types';
import {
  getHeaderCellMergeInfo,
  shouldRenderHeaderCell
} from '../utils/tableMergeUtils';

interface TableHeaderProps {
  headerRows: any[][];
  headers: string[];
  merges?: CellMerge[];
}

const TableHeader: React.FC<TableHeaderProps> = ({
  headerRows,
  headers,
  merges
}) => {
  return (
    <thead>
      {headerRows.map((headerRow, rowIndex) => (
        <tr key={rowIndex} className="bg-white">
          {headers.map((header, colIndex) => {
            if (!shouldRenderHeaderCell(rowIndex, colIndex, merges)) {
              return null;
            }
            const mergeInfo = getHeaderCellMergeInfo(
              rowIndex,
              colIndex,
              merges
            );
            // 使用 colIndex 从 headerRow 中获取单元格内容，确保列对齐
            const cell = headerRow[colIndex];
            const cellContent = cell != null ? String(cell) : '';
            return (
              <th
                key={colIndex}
                className="h-10 whitespace-nowrap px-4 text-left text-sm font-semibold text-gray-900"
                style={{
                  minWidth: '100px',
                  borderTop: rowIndex === 0 ? '1px solid #e5e7eb' : 'none',
                  borderBottom: '1px solid #e5e7eb',
                  verticalAlign: 'middle'
                }}
                colSpan={mergeInfo?.colSpan || 1}
                rowSpan={mergeInfo?.rowSpan || 1}
              >
                {cellContent}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
};

export default TableHeader;
