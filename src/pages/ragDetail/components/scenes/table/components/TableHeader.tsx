/**
 * Table Header Component
 * 表头组件
 */

import React from 'react';
import {
  shouldRenderHeaderCell,
  getHeaderCellMergeInfo,
  isFirstRowMerge
} from '../utils/tableMergeUtils';
import { CellMerge } from '../../../../types';

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
          {headerRow.map((cell, colIndex) => {
            if (!shouldRenderHeaderCell(rowIndex, colIndex, merges)) {
              return null;
            }
            const mergeInfo = getHeaderCellMergeInfo(
              rowIndex,
              colIndex,
              merges
            );
            const cellContent = cell != null ? String(cell) : '';

            // 如果是从第一行开始的跨行合并单元格，不加粗
            const shouldBold = !isFirstRowMerge(rowIndex, mergeInfo);
            return (
              <th
                key={colIndex}
                className={`h-10 px-4 text-left text-sm text-gray-900 ${shouldBold ? 'font-semibold' : ''}`}
                style={{
                  ...(headers.length >= 4
                    ? { width: '200px', minWidth: '200px' }
                    : {
                        width: `${100 / headers.length}%`
                      }),
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
