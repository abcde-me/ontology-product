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
            return (
              <th
                key={colIndex}
                className="h-10 px-4 text-left text-sm font-semibold text-gray-900"
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
